import { Routes } from '@angular/router';
import { LandingComponent } from './landing/landing.component';

export const routes: Routes = [
  { path: ':id', component: LandingComponent }, // Rota que captura o ID
  { path: '', redirectTo: '/', pathMatch: 'full' } // Adicione uma rota padrão se necessário
];
