<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AccountValidatedNotification extends Notification
{
    use Queueable;

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Votre compte a été validé !')
            ->greeting('Félicitations ' . $notifiable->name . ' !')
            ->line('Votre compte a été validé par notre équipe.')
            ->line('Vous pouvez maintenant accéder à toutes les fonctionnalités de la plateforme.')
            ->line('Commencez dès maintenant à explorer nos offres d\'affiliation.')
            ->action('Accéder à la plateforme', url('/'))
            ->salutation('Cordialement, L\'équipe');
    }
}