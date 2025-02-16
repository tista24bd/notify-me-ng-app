import { Routes } from '@angular/router';
import { NotifyAppComponent } from './components/notify-app/notify-app.component';

export const routes: Routes = [
    { path: 'notify-app', component: NotifyAppComponent }, 
    { path: '', redirectTo: 'notify-app', pathMatch: 'full' }, 
    { path: '**', redirectTo: 'notify-app' }
];

