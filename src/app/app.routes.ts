import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { RegistroComponent } from './components/registro/registro.component';
import { InicioComponent } from './components/inicio/inicio.component';
import { NoAdminGuard } from './guards/no-admin.guard';
import { NoUserGuard } from './guards/no-user.guard';
import { CatalogoComponent } from './components/catalogo/catalogo.component';
import { ForoComponent } from './components/foro/foro.component';



export const routes: Routes = [
  { path: '', redirectTo: 'inicio', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [NoUserGuard] },
  { path: 'inicio', component: InicioComponent, canActivate: [NoAdminGuard] },
  { path: 'catalogo', component: CatalogoComponent, canActivate: [NoAdminGuard] },
  { path: 'foro', component: ForoComponent, canActivate: [NoAdminGuard] }

];