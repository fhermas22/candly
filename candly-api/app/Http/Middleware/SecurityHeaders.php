<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeaders
{
    /**
     * Add baseline hardening headers for browser-based clients.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Frame-Options', 'DENY');

        // Delete the X-Powered-By header to avoid revealing the backend technology (PHP/Laravel).
        header_remove('X-Powered-By');

        // HSTS : force HTTPS for 1 year (31536000 seconds) and include subdomains
        // Note: This should only be enabled in production with HTTPS.
        // $response->headers->set(
        //     'Strict-Transport-Security',
        //     'max-age=31536000; includeSubDomains'
        // );

        // CSP : Define a Content Security Policy to mitigate XSS and data injection attacks
        // Adapted to Candly (React + API on the same domain)
        $response->headers->set(
            'Content-Security-Policy',
            "default-src 'self'; " .
                "script-src 'self' 'unsafe-inline'; " . // 'unsafe-inline' : for development only, remove in production and use a nonce or hash for inline scripts
                "style-src 'self' 'unsafe-inline'; " .
                "img-src 'self' data: https:; " .
                "font-src 'self' https:; " .
                "connect-src 'self' " . env(
                    'FRONTEND_URL',
                    'http://localhost:5173'
                ) . "; " .
                "frame-ancestors 'none';"
        );

        // Referrer Policy : controls how much referrer information is sent with requests
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');

        // Permissions Policy : disables unused browser features
        $response->headers->set(
            'Permissions-Policy',
            'geolocation=(), microphone=(), camera=()'
        );

        // Remove the Server header to avoid revealing the server software (e.g., Apache, Nginx)
        $response->headers->remove('Server');

        return $response;
    }
}
