<?php

namespace App\Serializer\Normalizer;

use App\Entity\Address;
use App\Entity\User;
use Symfony\Component\Serializer\Normalizer\CacheableSupportsMethodInterface;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;

class UserNormalizer implements NormalizerInterface, CacheableSupportsMethodInterface
{
    /**
     * @param User $object
     * @param null $format
     * @param array $context
     * @return array
     */
    public function normalize($object, $format = null, array $context = []): array
    {
        return [
            'email'            => $object->getEmail(),
            'name'             => $object->getName(),
        ];
    }

    public function supportsNormalization($data, $format = null): bool
    {
        return $data instanceof User && $format === 'json';
    }

    public function hasCacheableSupportsMethod(): bool
    {
        return true;
    }
}
