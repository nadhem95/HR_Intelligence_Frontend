import { Component, ViewChild, ElementRef } from '@angular/core';
import { ChatbotService, fadeInAnimation, ChatResponse, ChatOption } from '../chatbot.service';
import { Router } from '@angular/router';

interface Message {
  text: string;
  isBot: boolean;
}

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css'],
  animations: [fadeInAnimation]
})
export class ChatbotComponent {
  @ViewChild('chatBox') chatBox!: ElementRef;
  isOpen = false;
  redirected = false;
  messages: Message[] = [];
  currentOptions: ChatOption[] = [];

  constructor(
    private chatbotService: ChatbotService,
    private router: Router
  ) {}

  toggleChat() {
    this.isOpen = !this.isOpen;
    if (this.isOpen && this.messages.length === 0) {
      this.initChat();
    }
  }

  initChat() {
    const welcomeData = this.chatbotService.getWelcomeData();
    this.messages = [];
    this.showMessages(welcomeData.title, () => {
      this.currentOptions = welcomeData.options;
    });
  }

  showMessages(messages: string[], callback?: () => void) {
    if (!messages || !messages.length) {
      if (callback) callback();
      return;
    }

    messages.forEach((msg, i) => {
      setTimeout(() => {
        this.addMessage(msg, true);
        if (i === messages.length - 1 && callback) {
          callback();
        }
      }, i * 300);
    });
  }

  addMessage(text: string, isBot: boolean) {
    this.messages.push({ text, isBot });
    this.scrollToBottom();
  }

  selectOption(option: ChatOption) {
    this.addMessage(option.text, false);
    this.currentOptions = [];

    if (option.url) {
      setTimeout(() => {
        this.addMessage("Redirection en cours...", true);
        this.redirected = true;
        setTimeout(() => this.router.navigate([option.url]), 1000);
      }, 500);
      return;
    }

    if (option.action) {
      const response = this.chatbotService.getResponseData(option.action);
      if (response) {
        setTimeout(() => {
          this.showMessages(response.title, () => {
            if (response.tips && response.tips.length > 0) {
              this.showMessages(response.tips, () => {
                this.currentOptions = response.options;
              });
            } else {
              this.currentOptions = response.options;
            }
          });
        }, 500);
      }
    }
  }

  goBackToChatbot() {
    this.redirected = false;
    this.initChat();
  }

  scrollToBottom() {
    setTimeout(() => {
      if (this.chatBox) {
        this.chatBox.nativeElement.scrollTop = this.chatBox.nativeElement.scrollHeight;
      }
    }, 0);
  }

}
