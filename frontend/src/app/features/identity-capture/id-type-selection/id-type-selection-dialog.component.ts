import { Component, Inject, Optional } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SHARED_IMPORTS } from 'src/app/shared';

@Component({
  standalone: true,
  selector: 'id-type-selection-dialog',
  imports: [...SHARED_IMPORTS],
  templateUrl: './id-type-selection-dialog.component.html',
  styleUrls: ['./id-type-selection-dialog.component.scss']
})
export class IdTypeSelectionDialogComponent {
  selectionForm = this.fb.group({
    region: ['US', Validators.required],
    idType: ['', Validators.required]
  });

  regions = [
    { code: 'US', name: 'United States' }
  ];

  idTypes = [
    { value: 'drivers_license', label: "Driver's license or learner's permit" },
    { value: 'passport', label: 'Passport' },
    { value: 'state_id', label: 'State ID card' },
    { value: 'passport_card', label: 'Passport card' },
    { value: 'work_permit', label: 'Work permit' },
    { value: 'permanent_resident', label: 'Permanent resident card' }
  ];

  constructor(
    private fb: FormBuilder,
    @Optional() private dialogRef?: MatDialogRef<IdTypeSelectionDialogComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data?: any
  ) { }

  get selectedIdTypeLabel(): string {
    const selected = this.idTypes.find(t => t.value === this.selectionForm.value.idType);
    return selected?.label || '';
  }

  get selectedRegionLabel(): string {
    const selected = this.regions.find(r => r.code === this.selectionForm.value.region);
    return selected?.name || '';
  }

  onContinue(): void {
    if (this.selectionForm.invalid) {
      this.selectionForm.markAllAsTouched();
      return;
    }

    const formValue = this.selectionForm.value;
    if (this.dialogRef) {
      this.dialogRef.close({
        region: formValue.region,
        idType: formValue.idType
      });   
    }
  }
  onCancel(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }
}
