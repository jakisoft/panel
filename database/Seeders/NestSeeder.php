<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Pterodactyl\Services\Nests\NestCreationService;
use Pterodactyl\Contracts\Repository\NestRepositoryInterface;

class NestSeeder extends Seeder
{
    /**
     * @var NestCreationService
     */
    private $creationService;

    /**
     * @var NestRepositoryInterface
     */
    private $repository;

    /**
     * NestSeeder constructor.
     */
    public function __construct(
        NestCreationService $creationService,
        NestRepositoryInterface $repository,
    ) {
        $this->creationService = $creationService;
        $this->repository = $repository;
    }

    /**
     * Run the seeder to add missing nests to the Panel.
     *
     * @throws \Pterodactyl\Exceptions\Model\DataValidationException
     */
    public function run()
    {
        $items = $this->repository->findWhere([
            'name' => 'All in One',
        ])->keyBy('name')->toArray();

        $this->createAllInOneNest(array_get($items, 'All in One'));
    }

    /**
     * Create the All in One nest to be used later on.
     *
     * @throws \Pterodactyl\Exceptions\Model\DataValidationException
     */
    private function createAllInOneNest(?array $nest = null)
    {
        if (is_null($nest)) {
            $this->creationService->handle([
                'name' => 'All in One',
                'description' => 'All in One Nest with multi-language & cloudflare tunnel support.',
            ], 'support@jaky.dev');
        }
    }
}
