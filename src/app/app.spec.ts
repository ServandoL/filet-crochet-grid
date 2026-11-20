import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { appConfig } from './app.config';
import { PatternApiService } from './core/services/pattern-api.service';

const ME = '/household-api/api/v1/me';

const me = (households: { id: string; name: string }[]) => ({
  email: 'sam@example.com',
  households: households.map((h) => ({ ...h, address: null, role: 'ADMIN', memberCount: 2 })),
  deletedHouseholds: [],
  invites: [],
});

/** HouseholdContext resolves /me through a promise chain; let it finish, then render. */
async function settle(fixture: { whenStable(): Promise<unknown>; detectChanges(): void }) {
  for (let i = 0; i < 5; i++) await Promise.resolve();
  await fixture.whenStable();
  fixture.detectChanges();
}

describe('App', () => {
  let http: HttpTestingController;

  beforeEach(async () => {
    try {
      localStorage.clear();
    } catch {
      // Not available in every test environment.
    }
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [...appConfig.providers, provideHttpClientTesting()],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
  });

  it('renders the app only once a household is chosen', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('router-outlet')).toBeNull();

    http.expectOne(ME).flush(me([{ id: 'h1', name: 'Lake house' }]));
    await settle(fixture);
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });

  it('sends the household with every pattern call', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    http.expectOne(ME).flush(me([{ id: 'h1', name: 'Lake house' }]));
    await settle(fixture);

    TestBed.inject(PatternApiService).getPatterns().subscribe();
    const call = http.expectOne('/filet-crochet-api/api/patterns');
    expect(call.request.headers.get('X-Household-Id')).toBe('h1');
    call.flush([]);
  });

  it('asks which household to use when there are several', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    http.expectOne(ME).flush(me([{ id: 'h1', name: 'Lake house' }, { id: 'h2', name: 'City flat' }]));
    await settle(fixture);

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Choose a household');
    expect(compiled.querySelector('router-outlet')).toBeNull();
  });
});
