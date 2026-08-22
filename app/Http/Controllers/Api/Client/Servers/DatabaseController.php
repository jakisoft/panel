<?php

namespace Pterodactyl\Http\Controllers\Api\Client\Servers;

use Illuminate\Http\Response;
use Pterodactyl\Models\Server;
use Pterodactyl\Models\Database;
use Pterodactyl\Facades\Activity;
use Pterodactyl\Exceptions\DisplayException;
use Pterodactyl\Services\Databases\DatabasePasswordService;
use Pterodactyl\Transformers\Api\Client\DatabaseTransformer;
use Pterodactyl\Services\Databases\DatabaseManagementService;
use Pterodactyl\Services\Databases\DeployServerDatabaseService;
use Pterodactyl\Http\Controllers\Api\Client\ClientApiController;
use Pterodactyl\Http\Requests\Api\Client\Servers\Databases\GetDatabasesRequest;
use Pterodactyl\Http\Requests\Api\Client\Servers\Databases\StoreDatabaseRequest;
use Pterodactyl\Http\Requests\Api\Client\Servers\Databases\DeleteDatabaseRequest;
use Pterodactyl\Http\Requests\Api\Client\Servers\Databases\RotatePasswordRequest;

class DatabaseController extends ClientApiController
{
    /**
     * DatabaseController constructor.
     */
    public function __construct(
        private DeployServerDatabaseService $deployDatabaseService,
        private DatabaseManagementService $managementService,
        private DatabasePasswordService $passwordService,
    ) {
        parent::__construct();
    }

    /**
     * Return all the databases that belong to the given server.
     */
    public function index(GetDatabasesRequest $request, Server $server): array
    {
        return $this->fractal->collection($server->databases)
            ->transformWith($this->getTransformer(DatabaseTransformer::class))
            ->toArray();
    }

    /**
     * Create a new database for the given server and return it.
     *
     * @throws \Throwable
     * @throws \Pterodactyl\Exceptions\Service\Database\TooManyDatabasesException
     * @throws \Pterodactyl\Exceptions\Service\Database\DatabaseClientFeatureNotEnabledException
     */
    public function store(StoreDatabaseRequest $request, Server $server): array
    {
        $database = Activity::event('server:database.create')->transaction(function ($log) use ($request, $server) {
            if ($server->databases()->lockForUpdate()->count() >= $server->database_limit) {
                throw new DisplayException('Cannot create additional databases on this server: limit has been reached.');
            }

            $database = $this->deployDatabaseService->handle($server, $request->validated());

            $log->subject($database)->property('name', $database->database);

            return $database;
        });

        return $this->fractal->item($database)
            ->parseIncludes(['password'])
            ->transformWith($this->getTransformer(DatabaseTransformer::class))
            ->toArray();
    }

    /**
     * Rotates the password for the given server model and returns a fresh instance to
     * the caller.
     *
     * @throws \Throwable
     */
    public function rotatePassword(RotatePasswordRequest $request, Server $server, Database $database): array
    {
        Activity::event('server:database.rotate-password')
            ->subject($database)
            ->property('name', $database->database)
            ->transaction(fn () => $this->passwordService->handle($database));

        return $this->fractal->item($database->refresh())
            ->parseIncludes(['password'])
            ->transformWith($this->getTransformer(DatabaseTransformer::class))
            ->toArray();
    }

    /**
     * Import a SQL file into the database.
     */
    public function import(\Illuminate\Http\Request $request, Server $server, Database $database): \Illuminate\Http\JsonResponse
    {
        $request->validate([
            'file' => 'required_without:sql|file|max:51200',
            'sql' => 'required_without:file|string',
        ]);

        $sqlContent = '';
        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $ext = strtolower($file->getClientOriginalExtension());
            if ($ext === 'gz') {
                $sqlContent = gzdecode(file_get_contents($file->getRealPath()));
            } else {
                $sqlContent = file_get_contents($file->getRealPath());
            }
        } else {
            $sqlContent = $request->input('sql', '');
        }

        if (empty(trim($sqlContent))) {
            return new \Illuminate\Http\JsonResponse(['success' => false, 'error' => 'File SQL kosong atau tidak valid.'], 422);
        }

        try {
            $host = $database->host;
            $dsn = sprintf('mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4', $host->host, $host->port, $database->database);
            $pdo = new \PDO($dsn, $database->username, $database->password, [
                \PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION,
                \PDO::MYSQL_ATTR_MULTI_STATEMENTS => true,
            ]);

            $pdo->exec($sqlContent);

            Activity::event('server:database.import')
                ->subject($database)
                ->property('name', $database->database)
                ->log();

            return new \Illuminate\Http\JsonResponse([
                'success' => true,
                'message' => 'Database SQL berhasil diimport ke ' . $database->database . '!',
            ]);
        } catch (\Exception $e) {
            return new \Illuminate\Http\JsonResponse([
                'success' => false,
                'error' => 'Gagal mengimport SQL: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Removes a database from the server.
     *
     * @throws \Pterodactyl\Exceptions\Repository\RecordNotFoundException
     */
    public function delete(DeleteDatabaseRequest $request, Server $server, Database $database): Response
    {
        $this->managementService->delete($database);

        Activity::event('server:database.delete')
            ->subject($database)
            ->property('name', $database->database)
            ->log();

        return new Response('', Response::HTTP_NO_CONTENT);
    }
}
