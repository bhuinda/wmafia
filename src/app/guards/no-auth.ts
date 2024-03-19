import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@app/shared/services/auth';
import { tap } from 'rxjs';

export const noAuthGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.status$.pipe(
    tap(isValid => {
      if (isValid) {
        router.navigate(['/auth']);
      }
    })
  );
};
