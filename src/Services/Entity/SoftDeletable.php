<?php

namespace App\Services\Entity;

trait SoftDeletable
{
    /**
     * @ORM\Column(type="datetime")
     */
    protected $deleted_at = null;

    /**
     * @param mixed $deleted_at
     *
     * @return SoftDeletable
     */
    public function setDeletedAt ($deleted_at)
    {
        $this->deleted_at = $deleted_at;
        return $this;
    }

    public function getDeletedAt (): ?\DateTimeInterface
    {
        return $this->deleted_at;
    }
}