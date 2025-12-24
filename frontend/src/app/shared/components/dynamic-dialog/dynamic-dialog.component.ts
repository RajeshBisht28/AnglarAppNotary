import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MATERIAL_IMPORTS } from '../../material/material-imports';
import { NotificationService } from '../../../core/services/notification.service';
import { finalize, isObservable, Observable, of } from 'rxjs';
import { AuthService } from 'src/app/core';

export type DynamicFieldType = 'text' | 'textarea' | 'number' | 'email' | 'password' | 'select' | 'date' | 'checkbox';

export interface DynamicDialogField {
  name: string;
  label: string;
  type: DynamicFieldType;
  placeholder?: string;
  value?: any;
  required?: boolean;
  disabled?: boolean;
  options?: Array<{ label: string; value: any }>; // for select
  validators?: Array<'required' | 'email' | 'min' | 'max' | 'minLength' | 'maxLength' | 'pattern'>;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
}

export interface DynamicDialogButton {
  text: string;
  color?: 'primary' | 'accent' | 'warn' | undefined;
  type?: 'submit' | 'close' | 'custom';
  actionKey?: string; // used when type is custom
  disabledWhenInvalid?: boolean;
}

export interface DynamicDialogConfig<T = any> {
  title: string;
  message?: string;
  fields?: DynamicDialogField[];
  buttons?: DynamicDialogButton[];
  // Called when submit button is pressed and form is valid
  onSubmit?: (payload: any) => Observable<T> | T;
  // Optional callback for custom button clicks
  onAction?: (actionKey: string, payload: any) => Observable<T> | T;
  initialValues?: Record<string, any>;
  autoCloseOnSuccess?: boolean;
}

@Component({
  selector: 'app-dynamic-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ...MATERIAL_IMPORTS],
  templateUrl: './dynamic-dialog.component.html',
  styleUrls: ['./dynamic-dialog.component.scss']
})
export class DynamicDialogComponent<T = any> {
  form: FormGroup = this.fb.group({});
  isSubmitting = false;
  user: any;
  defaultButtons: DynamicDialogButton[] = [
    { text: 'Cancel', type: 'close' },
    { text: 'Save', type: 'submit', color: 'primary', disabledWhenInvalid: true }
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DynamicDialogComponent<T>, T | undefined>,
    @Inject(MAT_DIALOG_DATA) public config: DynamicDialogConfig<T>,
    private notification: NotificationService,
    public authService: AuthService,
  ) {
    this.buildForm();
    this.user = this.authService.getUser();
  }

private buildForm(): void {
  const controls: Record<string, FormControl> = {};

  (this.config.fields || []).forEach(field => {
    const validatorList: any[] = [];

    if (field.required || field.validators?.includes('required')) {
      validatorList.push(field.type === 'checkbox' ? Validators.requiredTrue : Validators.required);
    }

    if (field.validators?.includes('email')) validatorList.push(Validators.email);
    if (field.validators?.includes('min') && field.min !== undefined) validatorList.push(Validators.min(field.min));
    if (field.validators?.includes('max') && field.max !== undefined) validatorList.push(Validators.max(field.max));
    if (field.validators?.includes('minLength') && field.minLength !== undefined) validatorList.push(Validators.minLength(field.minLength));
    if (field.validators?.includes('maxLength') && field.maxLength !== undefined) validatorList.push(Validators.maxLength(field.maxLength));


    if (field.validators?.includes('pattern') && field.pattern) {
      validatorList.push(this.nameValidator());
    }

    const initial = this.config.initialValues?.[field.name] ?? field.value ?? null;

    controls[field.name] = new FormControl(
      { value: initial, disabled: field.disabled },
      { validators: validatorList, updateOn: 'blur' }
    );
  });

  this.form = this.fb.group(controls);
}

private nameValidator() {
  return (control: FormControl) => {
    if (!control.value) return null;

    const regex = /^[A-Za-z0-9._@~\- ]+$/;

    return regex.test(control.value)
      ? null
      : { pattern: true };
  };
}


  close(): void {
    this.dialogRef.close(undefined);
  }

  submit(): void {
  if (!this.config.onSubmit) {
    this.notification.showError('No submit handler provided');
    return;
  }

  if (this.form.invalid) {
    this.form.markAllAsTouched();
    this.notification.showError('Please correct the highlighted fields');
    return;
  }

  this.isSubmitting = true;
  const result$ = this.toObservable(this.config.onSubmit(this.form.getRawValue()));

  result$.pipe(
    finalize(() => this.isSubmitting = false)
  ).subscribe({
    next: (result: any) => {
      if('status' in result && result.status === false){
        this.notification.showError(result.message || 'An error occurred while saving' );
        return;
      }
      this.notification.showSuccess('Saved successfully');
      if (this.config.autoCloseOnSuccess !== false) {
        this.dialogRef.close(result);
      }
    },
    error: (err: any) => {
      const message = err?.error?.message || err?.message || 'An unexpected error occurred';
      this.notification.showError(message);
    }
  });
}

 onCustom(actionKey: string): void {
  if (!this.config.onAction) return;

  this.isSubmitting = true;
  const result$ = this.toObservable(this.config.onAction(actionKey, this.form.getRawValue()));

  result$.pipe(
    finalize(() => this.isSubmitting = false)
  ).subscribe({
    next: (result) => {
      if (this.config.autoCloseOnSuccess) {
        this.dialogRef.close(result);
      }
    },
    error: (err: any) => {
      const message = err?.error?.message || err?.message || 'An unexpected error occurred';
      this.notification.showError(message);
    }
    });
}
  

  private toObservable<T>(input: T | Observable<T> | void): Observable<T> {
  if (isObservable(input)) {
    return input;
  }
  if (input === undefined) {
    // return an empty observable so pipe() works
    return of() as Observable<T>;
  }
  return of(input);
}

}


