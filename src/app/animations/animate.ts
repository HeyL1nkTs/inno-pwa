import { trigger, transition, style, animate, query, group, state } from '@angular/animations';

export const fadeAnimation = trigger('fadeAnimation', [
    transition('* => *', [
        query(':enter, :leave', style({ position: 'fixed', width: '100%', zIndex: 2 }), { optional: true }),
        group([
            query(":enter", [
                style({ opacity: 0 }), animate('0.3s ease-in-out', style({ opacity: 1 }))
            ], { optional: true }),
            query(":leave", [
                style({ opacity: 1 }), animate('0.3s ease-in-out', style({ opacity: 0 }))
            ], { optional: true }),
        ])
    ]),
]);

export const fadeInAnimation = trigger('fadeIn', [
    transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms', style({ opacity: 1 })),
    ]),
]);

export const scaleAnimation = trigger('scaleAnimation', [
    state('void', style({ opacity: 0, transform: 'scale(0)' })), // Initial state for entering elements
    state('visible', style({ opacity: 1, transform: 'scale(1)' })), // Target state for entering elements
    transition('void => visible', [
        animate('0.3s ease-in-out', style({ opacity: 1, transform: 'scale(1.2)' })), // Animation on enter
        animate('100ms ease-in-out', style({ transform: 'scale(1)' })) // Optional scaling back to 1
    ]),
    transition('visible => void', animate('0.3s ease-in-out', style({ opacity: 0, transform: 'scale(0)' }))) // Animation on leave
]);

export const fadeComponent = trigger('fadeAnimation', [
    transition(':enter', [
        style({ opacity: 0 }),
        animate('500ms', style({ opacity: 1 }))
    ]),
    /*transition(':leave', [
        animate('500ms', style({ opacity: 0 }))
    ])*/
]);