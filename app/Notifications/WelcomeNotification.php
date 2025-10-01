<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class WelcomeNotification extends Notification
{
    use Queueable;

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Bienvenue sur notre plateforme d\'affiliation')
            ->greeting('Bonjour ' . $notifiable->name . ' !')
            ->line('Merci de vous être inscrit sur notre plateforme.')
            ->line('Votre compte est en cours de validation par notre équipe.')
            ->line('Vous recevrez un email de confirmation dès que votre compte sera validé.')
            ->line('En attendant, vous pouvez explorer notre plateforme.')
            ->salutation('Cordialement, L\'équipe');
    }
}