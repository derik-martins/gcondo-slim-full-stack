<?php

namespace App\Controllers;

use App\Http\HttpStatus;
use App\Http\Response\ResponseBuilder;
use App\Services\PersonService;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class PersonController
{
    public function __construct(private PersonService $service) {}

    public function list(Request $request, Response $response): Response
    {
        $data = ['people' => $this->service->list()];

        $response = ResponseBuilder::respondWithData($response, data: $data);

        return $response;
    }

    public function find(Request $request, Response $response, array $args): Response
    {
        $data = ['person' => $this->service->find($args['id'])];

        $response = ResponseBuilder::respondWithData($response, data: $data);

        return $response;
    }

    public function create(Request $request, Response $response): Response
    {
        $body = $request->getParsedBody();

        $data = ['person' => $this->service->create($body)];

        $response = ResponseBuilder::respondWithData($response, HttpStatus::Created, $data);

        return $response;
    }
}
