import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

export interface StepData {
  participants?: any[];
  documents?: File[];
  idVerification?: any;
  session?: any;
  payment?: any;
}

@Injectable({
  providedIn: 'root'
})
export class StepService {
  private stepDataSubject = new BehaviorSubject<StepData>({});
  public stepData$ = this.stepDataSubject.asObservable();

  private completedStepsSubject = new BehaviorSubject<Set<string>>(new Set());
  public completedSteps$ = this.completedStepsSubject.asObservable();

  private nextSubject = new Subject<void>();
  private prevSubject = new Subject<void>();
  public next$ = this.nextSubject.asObservable();
  public prev$ = this.prevSubject.asObservable();

  public saveForLaterSignal = signal(false)

  constructor() {}

  emitNext(): void {
    this.nextSubject.next();
  }

  emitPrev(): void {
    this.prevSubject.next();
  }

  markStepCompleted(packageId: string, stepName: string): void {
    const stepKey = `package_${packageId}_step_${stepName}_completed`;
    localStorage.setItem(stepKey, 'true');

    const completedSteps = new Set(this.completedStepsSubject.value);
    completedSteps.add(stepKey);
    this.completedStepsSubject.next(completedSteps);
  }

  isStepCompleted(packageId: string, stepName: string): boolean {
    const stepKey = `package_${packageId}_step_${stepName}_completed`;
    return localStorage.getItem(stepKey) === 'true';
  }

  saveStepData(packageId: string, stepName: string, data: any): void {
    const dataKey = `package_${packageId}_step_${stepName}_data`;
    localStorage.setItem(dataKey, JSON.stringify(data));

    const currentData = this.stepDataSubject.value;
    this.stepDataSubject.next({
      ...currentData,
      [stepName]: data
    });
  }

  getStepData(packageId: string, stepName: string): any {
    const dataKey = `package_${packageId}_step_${stepName}_data`;
    const data = localStorage.getItem(dataKey);
    return data ? JSON.parse(data) : null;
  }

  clearPackageData(packageId: string): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(`package_${packageId}_`)) {
        localStorage.removeItem(key);
      }
    });

    this.stepDataSubject.next({});
    this.completedStepsSubject.next(new Set());
  }

  getAllPackageData(packageId: string): StepData {
    return {
      documents: this.getStepData(packageId, 'documents'),
      participants: this.getStepData(packageId, 'participants'),
      idVerification: this.getStepData(packageId, 'idVerification'),
      session: this.getStepData(packageId, 'session'),
      payment: this.getStepData(packageId, 'payment')
    };
  }
}
