<x-mail::message>
# Verify Your Email Address

Thanks for your interest in Perth Web Devs!

Due to weird spammers who think filling out fake RSVPs is going to get them traffic, we need to verify your email address.

@if($type === 'rsvp')
Your RSVP to **{{ $event->name }}** ({{ $group->name }}) will be confirmed once you click the "Verify Email Address" button below.
@else
Your subscription to **{{ $group->name }}** will be confirmed once you click the "Verify Email Address" button below.
@endif

Please click the button below to verify your email address and complete your {{ $type === 'rsvp' ? 'RSVP' : 'subscription' }}.

<x-mail::button :url="$verificationUrl">
Verify Email Address
</x-mail::button>

This link will expire in 48 hours.

If you didn't make this request, you can safely ignore this email.

Thanks,<br>
Jason O'Neil<br>
{{ $group->name }}

</x-mail::message>
