import { Injectable } from '@angular/core';

export interface DeviceValidationResult {
  isValid: boolean;
  hasCamera: boolean;
  hasMicrophone: boolean;
  cameraError?: string;
  microphoneError?: string;
  allErrors: string[];
}

@Injectable({
  providedIn: 'root'
})
export class MediaDeviceValidationService {
  
  async validateMediaDevices(): Promise<DeviceValidationResult> {
    const result: DeviceValidationResult = {
      isValid: true,
      hasCamera: false,
      hasMicrophone: false,
      allErrors: []
    };

    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      result.isValid = false;
      result.allErrors.push('Your browser does not support the MediaDevices API. Please use a modern browser.');
      return result;
    }

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      const audioDevices = devices.filter(device => device.kind === 'audioinput');

      if (videoDevices.length === 0) {
        result.hasCamera = false;
        result.cameraError = 'No camera device found. Please ensure a camera is connected and enabled in your device settings.';
        result.allErrors.push(result.cameraError);
        result.isValid = false;
      } else {
        result.hasCamera = true;
      }

      if (audioDevices.length === 0) {
        result.hasMicrophone = false;
        result.microphoneError = 'No microphone device found. Please ensure a microphone is connected and enabled in your device settings.';
        result.allErrors.push(result.microphoneError);
        result.isValid = false;
      } else {
        result.hasMicrophone = true;
      }

      if (result.hasCamera || result.hasMicrophone) {
        try {
          const constraints: MediaStreamConstraints = {
            video: result.hasCamera,
            audio: result.hasMicrophone
          };

          const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
          
          mediaStream.getTracks().forEach(track => track.stop());
          
          const videoTracks = mediaStream.getVideoTracks();
          const audioTracks = mediaStream.getAudioTracks();

          if (result.hasCamera && videoTracks.length === 0) {
            result.hasCamera = false;
            result.cameraError = 'Unable to access camera. Please check camera permissions in your browser settings.';
            result.allErrors = result.allErrors.filter(err => err !== result.cameraError);
            result.allErrors.push(result.cameraError);
            result.isValid = false;
          }

          if (result.hasMicrophone && audioTracks.length === 0) {
            result.hasMicrophone = false;
            result.microphoneError = 'Unable to access microphone. Please check microphone permissions in your browser settings.';
            result.allErrors = result.allErrors.filter(err => err !== result.microphoneError);
            result.allErrors.push(result.microphoneError);
            result.isValid = false;
          }
        } catch (error: any) {

          const errorMessage = error.name === 'NotAllowedError'
            ? 'Camera/Microphone permission denied. Please allow access in browser settings.'
            : `Cannot access media devices: ${error.message}`;
          
          result.isValid = false;
          result.allErrors.push(errorMessage);
          
          if (result.hasCamera) {
            result.hasCamera = false;
            result.cameraError = errorMessage;
          }
          if (result.hasMicrophone) {
            result.hasMicrophone = false;
            result.microphoneError = errorMessage;
          }
        }
      }

      return result;
    } catch (error: any) {
      result.isValid = false;
      result.allErrors.push(`Failed to validate media devices: ${error.message}`);
      return result;
    }
  }

  async checkCameraPermission(): Promise<boolean> {
    try {
      const result = await this.validateMediaDevices();
      return result.hasCamera;
    } catch {
      return false;
    }
  }

  async checkMicrophonePermission(): Promise<boolean> {
    try {
      const result = await this.validateMediaDevices();
      return result.hasMicrophone;
    } catch {
      return false;
    }
  }
}
