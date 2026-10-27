import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { App } from './app';
import { AuthGuardService } from '../middleware/middleware.authguard';
import { UserService } from '../services/user.service';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        {
          provide: AuthGuardService,
          useValue: {
            authState$: of(false),
            isAuthenticated: () => false,
            getPrimaryRole: () => '',
            hasAnyRole: () => false,
            hasKeycloakCallback: () => false,
            handleKeycloakCallback: () => Promise.resolve({ status: 'idle' }),
            loginWithKeycloak: () => Promise.resolve(),
            getKeycloakLogoutUrl: () => '',
            clearStoredTokens: () => undefined,
          },
        },
        {
          provide: UserService,
          useValue: {
            logout: () => Promise.resolve(),
            getValidSession: () => Promise.resolve(null),
          },
        },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render app shell', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.brand-link')?.textContent?.toLowerCase()).toContain('tim12');
  });
});
