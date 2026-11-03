<?php

namespace App\Models;

class MediaAsset
{
    public string $id;
    public string $movieId;
    public string $filename;
    public string $originalName;
    public string $mimeType;
    public int $sizeBytes;
    public string $originalUrl;
    public string $thumbnailUrl;
    public string $dimensions;
    public string $createdAt;
    public string $updatedAt;

    public function __construct(array $attributes = [])
    {
        $this->id = $attributes['id'] ?? ('asset-' . bin2hex(random_bytes(6)));
        $this->movieId = $attributes['movieId'] ?? '';
        $this->filename = $attributes['filename'] ?? '';
        $this->originalName = $attributes['originalName'] ?? '';
        $this->mimeType = $attributes['mimeType'] ?? 'image/jpeg';
        $this->sizeBytes = (int) round($attributes['sizeBytes'] ?? 0);
        $this->originalUrl = $attributes['originalUrl'] ?? '';
        $this->thumbnailUrl = $attributes['thumbnailUrl'] ?? '';
        $this->dimensions = $attributes['dimensions'] ?? '300x450';
        $this->createdAt = $attributes['createdAt'] ?? gmdate('Y-m-d\TH:i:s\Z');
        $this->updatedAt = $attributes['updatedAt'] ?? gmdate('Y-m-d\TH:i:s\Z');
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'movieId' => $this->movieId,
            'filename' => $this->filename,
            'originalName' => $this->originalName,
            'mimeType' => $this->mimeType,
            'sizeBytes' => $this->sizeBytes,
            'originalUrl' => $this->originalUrl,
            'thumbnailUrl' => $this->thumbnailUrl,
            'dimensions' => $this->dimensions,
            'createdAt' => $this->createdAt,
            'updatedAt' => $this->updatedAt,
        ];
    }
}
