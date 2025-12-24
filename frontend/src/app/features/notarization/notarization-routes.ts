import { Routes } from '@angular/router';
import { VideoConferenceComponent } from './video-conference/video-conference.component';

export const notarizationRoutes: Routes = [{
  path: "package/:id/signer/:signerId",
  component: VideoConferenceComponent
},];

