<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;

class AccountDeactivatedNotification
{
    use Queueable;

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Votre compte a été désactivé')
            ->greeting('Bonjour ' . $notifiable->name . ',')
            ->line('Nous vous informons que votre compte a été désactivé par notre équipe.')
            ->line('Cela signifie que vous ne pouvez plus accéder à la plateforme pour le moment.')
            ->line('Si vous pensez qu’il s’agit d’une erreur ou si vous souhaitez réactiver votre compte, veuillez contacter notre support.')
            ->action('Contacter le support', url('/contact'))
            ->salutation('Cordialement, L’équipe.');
    }
}
