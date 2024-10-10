import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
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
import { LottieComponent, type AnimationOptions } from 'ngx-lottie';
import type { AnimationItem } from 'lottie-web';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgLabelTemplateDirective,
    NgOptionTemplateDirective,
    NgSelectComponent,
    RouterModule,
    CommonModule,
    LottieComponent,
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
  hasId: boolean = false;

  private animationItem: AnimationItem | undefined;

  options: AnimationOptions = {
    path: '/assets/animations/globe.json',
    loop: true,
    autoplay: false,
  };
  giftById: any;

  animationCreated(animationItem: AnimationItem): void {
    this.animationItem = animationItem;
  }

  get currentIndex$() {
    return this.currentIndexSubject.asObservable();
  }

  constructor(
    private fb: FormBuilder,
    private apiService: QrGiftApiService,
    private route: ActivatedRoute
  ) {
    this.formGroup = this.fb.group({
      from: ['', Validators.required],
      to: ['', Validators.required],
      // email: ['', Validators.required],
      message: ['', Validators.required],
      year: ['', Validators.required],
      linkYoutube: ['', null],
      pictures: ['', Validators.required],
      audio: ['', this.selectedPlan === 1 ? null : Validators.required],
    });
  }

  ngOnInit(): void {
    this.getAllYearsUntilCurrent();

    this.route.params.subscribe((res) => {
      const id = window.location.pathname.replace('/', '');
      console.log('res', id); // Log do ID
      if (id) {
        this.hasId = true;
        this.getGiftById(id); // Passa o ID para a função
      } else {
        console.log('Nenhum ID encontrado na URL.');
      }
    });

    this.carousel();
  }

  play(): void {
    if (this.animationItem) {
      this.animationItem.play();
    }
  }

  pause(): void {
    if (this.animationItem) {
      this.animationItem.pause();
    }
  }

  stop(): void {
    if (this.animationItem) {
      this.animationItem.stop();
    }
  }

  getGiftById(id: any) {
    this.apiService.getGift(id).subscribe((res) => {
      this.giftById = res;
    });
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
      let totalImages = this.imageSrc.length > 0  ? this.imageSrc.length : this.giftById.giftWebSiteImages.length;
      let currentIndex = this.currentIndexSubject.value;

      if (currentIndex >= totalImages - 1) {
        currentIndex = 0;
        console.log(currentIndex)
      } else {
        currentIndex += 1;
      }

      this.currentIndexSubject.next(currentIndex);
    }, 5000);
  }
  
  onSubmit() {
    //TODO: LIMPAR CAMPO DE AUDIO CASO O PLANO SEJA BASIC
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
    formData.append(
      'PlanTypeId',
      this.selectedPlan === 1 ? 'fPc2A1kLIdhdBFKPXyfz' : 'tGgt5gMYGomx5Ld1UfA'
    );
    formData.append('HolidayTypeId', 'lAj5OCzjdTMGTHrTDOiE'); // Se você tiver um ID fixo ou precisar ajustar
    this.images.forEach((image: File) => {
      formData.append('GiftWebSiteImages', image);
    }); // Aqui é onde você adiciona as imagens

    this.apiService.postGift(formData).subscribe((res) => console.log(res));
  }
}
