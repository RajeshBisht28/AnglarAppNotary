import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const stepGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  const packageId = route.parent?.paramMap.get('id') || route.paramMap.get('id');
  const currentPath = route.url[route.url.length - 1]?.path;

  if (!packageId) {
    router.navigate(['/document']);
    return false;
  }

  const user = authService.getUser();
  const isNotaryUser = user?.userType === 'Notary' || user?.role === 'Notary';

  // Define the step order and their dependencies
  const allStepOrder = ['document','participants', 'sign', 'id-verification', 'session', 'payment'];
  let stepOrder = allStepOrder;

  // For notary users, skip ID verification and payment steps
  if (isNotaryUser) {
    stepOrder = allStepOrder.filter(step => step !== 'id-verification' && step !== 'payment');
  }

  // If current path is a skipped step for notary users, redirect to the next available step
  if (isNotaryUser && (currentPath === 'id-verification' || currentPath === 'payment')) {
    const nextStep = currentPath === 'id-verification' ? 'session' : null;
    if (nextStep) {
      router.navigate(['/document/package', packageId, nextStep]);
      return false;
    } else {
      router.navigate(['/document/package', packageId, 'document']);
      return false;
    }
  }

  const currentStepIndex = stepOrder.indexOf(currentPath || '');

  if (currentStepIndex === -1) {
    router.navigate(['/document/package', packageId, 'document']);
    return false;
  }

  // Check if previous steps are completed
  // For now, we'll implement a simple check based on localStorage
  // In a real application, this would check against a service or API
  for (let i = 0; i < currentStepIndex; i++) {
    const stepKey = `package_${packageId}_step_${stepOrder[i]}_completed`;
    if (!localStorage.getItem(stepKey)) {
      // Previous step not completed, redirect to first incomplete step
      router.navigate(['/document/package', packageId, stepOrder[i]]);
      return false;
    }
  }

  return true;
};
