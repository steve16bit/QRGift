import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  NgLabelTemplateDirective,
  NgOptionTemplateDirective,
  NgSelectComponent,
} from '@ng-select/ng-select';
import { BehaviorSubject } from 'rxjs';
import { QrGiftApiService } from '../api/qrGiftApi.service';

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
  providers: [QrGiftApiService],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
})
export class LandingComponent {
  public currentIndexSubject: BehaviorSubject<number> =
    new BehaviorSubject<number>(0);
  public imagesQuantity: BehaviorSubject<number> = new BehaviorSubject<number>(
    0
  );

  formGroup: FormGroup;

  years: { name: string; value: number }[] = [{ name: '', value: 0 }];
  imageSrc: any[] = [];

  selectedPlan: number = 1;
  selectedYear: number = 0;
  message: string = '';
  images: any[] = [];
  errorMessage: string = '';
  audio: any;

  get currentIndex$() {
    return this.currentIndexSubject.asObservable();
  }

  constructor(private fb: FormBuilder, private apiService: QrGiftApiService) {
    this.formGroup = this.fb.group({
      from: ['', Validators.required],
      to: ['', Validators.required],
      email: ['', Validators.required],
      message: ['', Validators.required],
      year: ['', Validators.required],
      linkYoutube: ['', Validators.required],
      pictures: ['', Validators.required],
      audio: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.getAllYearsUntilCurrent();
  }

  getAllYearsUntilCurrent() {
    let getCurrentYear = new Date().getFullYear();
    let startYear = 1980;

    while (startYear <= getCurrentYear) {
      startYear++;
      this.years.push({ name: startYear.toString(), value: startYear });
    }
  }

  onYearChange($event: Event) {
    return $event;
  }

  changePlan(planType: number) {
    this.selectedPlan = planType;
  }

  changeYear(event: any) {
    this.selectedYear = event.name;
  }

  chageMessage(event: any) {
    console.log(event.target.value);
    this.message = event.target.value;
  }

  changeAudio(event: any) {
    console.log('event', event.target.files);
    this.audio = event.target.files[0];
  }

  changePicture(event: any) {
    this.imageSrc = [];
    this.images = [];
    this.errorMessage = '';

    const files = Array.from(event.target.files);

    console.log('how many files', files.length);

    if (this.selectedPlan === 1 && files.length > 3) {
      this.errorMessage =
        'No plano escolhido você pode escolher no máximo 3 imagens.';
      return;
    }

    if (this.selectedPlan === 2 && files.length > 7) {
      this.errorMessage =
        'No plano escolhido você pode escolher no máximo 7 imagens.';
      return;
    }

    files.forEach((image: any) => {
      if (image.size > 10_000_000) {
        return alert('As imagens tem que ser menores que 10MB');
      }

      if (!['image/png', 'image/jpeg'].includes(image.type)) {
        return alert(
          `Foram inseridas imagens do tipo ${image.type}, use apenas imagens do tipo .png ou .jpeg`
        );
      }

      this.images.push(image);

      const fileReader = new FileReader();

      fileReader.onload = () => {
        this.imageSrc.push(fileReader.result as string);
        if (this.imageSrc.length === 1) {
          this.carousel();
        }
      };

      fileReader.readAsDataURL(image);
    });
    console.log('IMAGESRC', this.imageSrc);
  }

  carousel() {
    setInterval(() => {
      let totalImages = this.imageSrc.length;
      let currentIndex = this.currentIndexSubject.value;

      if (currentIndex >= totalImages - 1) {
        currentIndex = 0;
      } else {
        currentIndex += 1;
      }

      this.currentIndexSubject.next(currentIndex);
    }, 5000);
  }

  // onSubmit() {
  //   if (this.formGroup.invalid) {
  //     this.formGroup.markAllAsTouched();
  //     return;
  //   }

  //   let data = {
  //     ReceiversName: this.formGroup.get('to')?.value,
  //     GiftGiverName: this.formGroup.get('from')?.value,
  //     Message: this.formGroup.get('message')?.value,
  //     AudioMessage: this.audio,
  //     MusicURL: this.formGroup.get('linkYoutube')?.value,
  //     PlanTypeId: this.selectedPlan,
  //     HolidayTypeId: 1,
  //     GiftWebSiteImages: this.images
  //   }

  //   this.apiService.postGift(data).subscribe({
  //     next: (res) => console.log(res),
  //     error: (error) => console.log(error)
  //   });

  //   console.log({
  //     ReceiversName: this.formGroup.get('to')?.value,
  //     GiftGiverName: this.formGroup.get('from')?.value,
  //     Message: this.formGroup.get('message')?.value,
  //     AudioMessage: this.audio,
  //     MusicURL: this.formGroup.get('linkYoutube')?.value,
  //     PlanTypeId: this.selectedPlan,
  //     HolidayTypeId: 1,
  //     GiftWebSiteImages: this.images
  //   });
  // }
  onSubmit() {
    if (this.formGroup.invalid) {
        this.formGroup.markAllAsTouched();
        return;
    }

    const formData = new FormData();

    formData.append('ReceiversName', this.formGroup.get('to')?.value);
    formData.append('GiftGiverName', this.formGroup.get('from')?.value);
    formData.append('Message', this.formGroup.get('message')?.value);
    formData.append('AudioMessage', this.audio); // Supondo que `audio` é um array de arquivos
    formData.append('MusicURL', this.formGroup.get('linkYoutube')?.value);
    formData.append('PlanType', this.selectedPlan.toString());
    formData.append('HolidayTypeId', '1'); // Se você tiver um ID fixo ou precisar ajustar
    this.images.forEach((image: File, index) => {
      formData.append('GiftWebSiteImages', image);
    }); // Aqui é onde você adiciona as imagens

    this.apiService.postGift(formData).subscribe({
        next: (res) => console.log(res),
        error: (error) => console.log(error)
    });
}

}
