<?php

namespace App\OpenApi;

use OpenApi\Attributes as OA;

#[OA\Info(
    title: 'Hotel Booking API',
    version: '1.0.0',
    description: 'REST API cho hệ thống đặt phòng khách sạn.',
)]
#[OA\Server(
    url: 'http://127.0.0.1:8000',
    description: 'Local development server',
)]
#[OA\SecurityScheme(securityScheme: 'sanctum', type: 'http', scheme: 'bearer', bearerFormat: 'Bearer Token')]
final class OpenApiInfo
{
}
