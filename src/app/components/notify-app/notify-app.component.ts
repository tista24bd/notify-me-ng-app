import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';
import localforage from 'localforage';

// Configure localForage (optional)
localforage.config({
  driver: localforage.INDEXEDDB,
  name: 'MusicApp',
  version: 1.0,
  storeName: 'musicStore',
});

@Component({
  selector: 'app-notify-app',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notify-app.component.html',
  styleUrls: ['./notify-app.component.css'],
  animations: [
    trigger('drawerAnimation', [
      state('open', style({
        transform: 'translateY(0)', // Drawer is fully visible
      })),
      state('closed', style({
        transform: 'translateY(-100%)', // Drawer is hidden above the viewport
      })),
      transition('open <=> closed', animate('0.5s ease-in-out')), // Smooth transition
    ]),
  ],
})

export class NotifyAppComponent implements OnInit {
  musicName: string = 'music name..';
  hours: number = 0;
  minutes: number = 0;
  seconds: number = 0;
  countdownInterval: any;
  isPaused: boolean = false; // Track if the timer is paused
  isStopped: boolean = true; // Track if the timer is paused
  isDisabled: boolean = true;
  audio!: any;
  isMusicPaused: boolean = false;
  @ViewChild('minuteInput') minuteInput!: ElementRef<HTMLInputElement>;
  isMusicPlaying: boolean = false;
  musicAdded: boolean = false; 
  drawerState: 'hidden' | 'visible' = 'hidden';
  message: string = 'enter valid message ';

  constructor() { }

  ngOnInit(): void {
    this.loadMusicToApp();
  }

  showDrawer(msg: string) {
    this.message = msg;
    this.drawerState = 'visible'
  }
  hideDrawer(msg: string) {
    this.message = msg;
    this.drawerState = 'hidden'

  }
  startCountdown(event: any) {

    const inputValue = parseFloat(this.minuteInput.nativeElement.value);

    if (isNaN(inputValue) || inputValue <= 0) {
      this.showDrawer('Min can not be zero or negative');
      setTimeout(() => {
        this.hideDrawer('');
        this.minuteInput.nativeElement.value = '';
      }, 3000);
      return;
    }

    const totalSeconds = inputValue * 60;
    this.hours = Math.floor(totalSeconds / 3600);
    this.minutes = Math.floor((totalSeconds % 3600) / 60);
    this.seconds = Math.floor(totalSeconds % 60);
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
    this.isPaused = false;
    this.isStopped = false;
    this.startTimer();
  }

  startTimer() {
    this.countdownInterval = setInterval(() => {
      if (!this.isPaused) {
        this.updateCountdown();
      }
    }, 1000);
  }

  updateCountdown() {
    if (this.seconds > 0) {
      this.seconds--;
    } else {
      if (this.minutes > 0) {
        this.minutes--;
        this.seconds = 59;
      } else {
        if (this.hours > 0) {
          this.hours--;
          this.minutes = 59;
          this.seconds = 59;
        } else {
          clearInterval(this.countdownInterval);

          this.showDrawer('Countdown Completed!');
          this.playMusic();
          this.stopTimer();
          setTimeout(() => {
            this.hideDrawer('');
          }, 2000);
        }
      }
    }
  }

  pauseTimer(event: any) {
    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      clearInterval(this.countdownInterval);
    } else {
      this.startTimer();
    }
  }
  stopTimer(event: any = null) {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }

    this.hours = 0;
    this.minutes = 0;
    this.seconds = 0;
    this.isPaused = false;
    this.isStopped = true;
    this.message = 'Countdown finished!'
    this.minuteInput.nativeElement.value = '';
  }
  async loadMusicToApp() {

    try {
      const file = await localforage.getItem<File>('customMusic'); // Retrieve the file
      if (file) {
        this.audio = new Audio(URL.createObjectURL(file)); // Create an Audio object
        this.musicName = file.name;
        this.musicAdded = true; 
      } else {
        let defaultFileUrl = '/media/morning_alarm.mp3'
        this.audio = new Audio(defaultFileUrl);
        this.musicName = defaultFileUrl.substring(defaultFileUrl.lastIndexOf('/') + 1);
      }
    } catch (error) {
      console.error('Error loading music:', error);
    }
  }

  async addMusicFile(event: any) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'audio/*';
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (file) {
        try {
          await localforage.setItem('customMusic', file); 
          this.musicName = file.name;
          this.musicAdded = true; 
        } catch (error) {
          console.error('Error storing file:', error);
        }
      }
    };
    input.click();
  }
  async deleteMusicFile(event: any = null) {
    try {
      await localforage.removeItem('customMusic');
      let defaultFileUrl = '/media/morning_alarm.mp3'
      this.musicName = defaultFileUrl.substring(defaultFileUrl.lastIndexOf('/') + 1);
      this.musicAdded = false; 
    } catch (error) {
      console.error('Error deleting music:', error);
    }
  }

  playMusic() {
    this.isMusicPlaying = true;
    this.isMusicPaused = false;
    this.audio.play();
    this.audio.onended = () => {
      this.isMusicPlaying = false;
    };
  }

  pauseMusic(event: any) {
    this.isMusicPaused = true;
    if (this.audio) {
      this.audio.pause();
    }
  }

  unPauseMusic(event: any) {
    this.isMusicPaused = false;
    if (this.audio) {
      this.audio.play();
    }
  }

  stopMusic(event: any) {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.isMusicPlaying = false;
      this.isMusicPaused = false;
    }
  }

}