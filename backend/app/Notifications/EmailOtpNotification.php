<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class EmailOtpNotification extends Notification
{
    use Queueable;

    public function __construct(
        public string $otp
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Verify your email address')
            ->greeting('Welcome to LinkGuard!')
            ->line('Your email verification code is:')
            ->line("**{$this->otp}**")
            ->line('This code expires in 15 minutes.')
            ->line('If you did not create an account, no further action is required.');
    }
}
