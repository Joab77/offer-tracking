<?php

namespace App\Notifications;

use App\Models\Participation;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ParticipationStatusChangedNotification extends Notification
{
    use Queueable;

    public function __construct(
        private Participation $participation,
        private string $oldStatus
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $message = (new MailMessage)
            ->subject('Mise à jour de votre participation')
            ->greeting('Bonjour ' . $notifiable->name . ' !');

        if ($this->participation->isApproved()) {
            $message->line('Excellente nouvelle ! Votre participation à l\'offre "' . $this->participation->offer->title . '" a été validée.')
                   ->line('Vous devriez recevoir votre commission prochainement.')
                   ->line('Montant de la commission : ' . $this->participation->offer->commission . ' €');
        } elseif ($this->participation->isRejected()) {
            $message->line('Nous vous informons que votre participation à l\'offre "' . $this->participation->offer->title . '" a été refusée.')
                   ->line('Cela peut arriver pour diverses raisons (non-respect des conditions, etc.).')
                   ->line('N\'hésitez pas à postuler à d\'autres offres !');
        }

        return $message->action('Voir mes participations', url('/api/participations'))
                      ->salutation('Cordialement, L\'équipe');
    }
}