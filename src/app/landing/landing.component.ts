import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, FormGroup, Validators } from '@angular/forms'
import { NgLabelTemplateDirective, NgOptionTemplateDirective, NgSelectComponent } from '@ng-select/ng-select';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    NgLabelTemplateDirective,
    NgOptionTemplateDirective,
    NgSelectComponent,
  ],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})
export class LandingComponent {
  formGroup: FormGroup;

  years: {name: string, value: number}[] = [{name: "", value: 0}];

  selectedPlan: number = 1;
  selectedYear: number = 0;
  message: string = "";
  images: any;

  constructor(private fb: FormBuilder) {
    this.formGroup = this.fb.group({
      from: ['', Validators.required],
      to: ['', Validators.required],
      email: ['', Validators.required],
      message: ['', Validators.required],
    })
  }

  ngOnInit(): void {
    this.getAllYearsUntilCurrent();
  }

  getAllYearsUntilCurrent() {
    let getCurrentYear = new Date().getFullYear();
    let startYear = 1980;

    console.log(getCurrentYear);

    while(startYear <= getCurrentYear) {
      startYear++
      this.years.push({name: (startYear).toString(), value: startYear});
    }
  }

  onYearChange($event: Event) {
    console.log($event
    )
  }

  changePlan(planType: number) {
    this.selectedPlan = planType;
  }

  changeYear(event: any) {
    console.log(event);
    this.selectedYear = event.name;
  }

  changePicture(event: any) {
    console.log(event)

    // event.files.forEach((image: any) => {
    //   if(image.size > 10_000_000) {
    //     return alert('As imagens tem que ser menores que 10MB')
    //   }

    //   if(!image.type.includes('image')) {
    //     return alert('Somente imagens são permitidas')
    //   }
    // });

    this.images = event.files
  }
}
