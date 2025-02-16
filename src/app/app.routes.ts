import { Routes } from '@angular/router';
import { NotifyAppComponent } from './components/notify-app/notify-app.component';

export const routes: Routes = [
    { path: 'notify-me', component: NotifyAppComponent }, 
    { path: '', redirectTo: 'notify-me', pathMatch: 'full' }, 
    { path: '**', redirectTo: 'notify-me' }
];

