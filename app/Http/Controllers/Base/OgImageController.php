<?php

namespace Pterodactyl\Http\Controllers\Base;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Pterodactyl\Http\Controllers\Controller;

class OgImageController extends Controller
{
    /**
     * Generate dynamic SVG Open Graph image banner based on current application
     * name and description or query parameters.
     */
    public function index(Request $request): Response
    {
        $rawTitle = (string) $request->query('title', config('app.name', 'JKSoft Cloud'));
        $rawDescription = (string) $request->query('description', config('app.description', 'High-Performance Game & Cloud Infrastructure Management Platform'));
        $rawTag = (string) $request->query('tag', 'NEXT-GEN CLOUD & GAME PANEL');
        $rawVersion = (string) $request->query('version', 'v2.4.0 • Enterprise Edition');

        // Truncate and sanitize inputs to prevent XML injection
        $title = mb_substr(trim($rawTitle), 0, 50, 'UTF-8');
        $description = mb_substr(trim($rawDescription), 0, 110, 'UTF-8');
        $tag = mb_substr(trim($rawTag), 0, 40, 'UTF-8');
        $version = mb_substr(trim($rawVersion), 0, 40, 'UTF-8');

        // Dynamic font-size based on title length
        $titleLength = mb_strlen($title, 'UTF-8');
        $fontSize = 44;
        if ($titleLength > 30) {
            $fontSize = 32;
        } elseif ($titleLength > 20) {
            $fontSize = 38;
        }

        // Format title with accent highlight on last word if multiple words exist
        $words = preg_split('/\s+/', $title);
        if (count($words) > 1) {
            $lastWord = array_pop($words);
            $formattedTitle = htmlspecialchars(implode(' ', $words), ENT_QUOTES | ENT_XML1, 'UTF-8')
                . ' <tspan fill="#38bdf8">' . htmlspecialchars($lastWord, ENT_QUOTES | ENT_XML1, 'UTF-8') . '</tspan>';
        } else {
            $formattedTitle = htmlspecialchars($title, ENT_QUOTES | ENT_XML1, 'UTF-8');
        }

        $safeDescription = htmlspecialchars($description, ENT_QUOTES | ENT_XML1, 'UTF-8');
        $safeTag = htmlspecialchars($tag, ENT_QUOTES | ENT_XML1, 'UTF-8');
        $safeVersion = htmlspecialchars($version, ENT_QUOTES | ENT_XML1, 'UTF-8');

        $svg = view('svg/og-image', [
            'title' => $title,
            'formattedTitle' => $formattedTitle,
            'description' => $safeDescription,
            'tag' => $safeTag,
            'version' => $safeVersion,
            'fontSize' => $fontSize,
        ])->render();

        $etag = '"' . md5($svg) . '"';

        if ($request->headers->get('If-None-Match') === $etag) {
            return response('', 304, [
                'Content-Type' => 'image/svg+xml; charset=utf-8',
                'ETag' => $etag,
                'Cache-Control' => 'public, max-age=300, stale-while-revalidate=86400',
            ]);
        }

        return response($svg, 200, [
            'Content-Type' => 'image/svg+xml; charset=utf-8',
            'ETag' => $etag,
            'Cache-Control' => 'public, max-age=300, stale-while-revalidate=86400',
        ]);
    }
}
