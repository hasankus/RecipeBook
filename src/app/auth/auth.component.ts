import { Component, ComponentFactoryResolver, OnDestroy, ViewChild } from "@angular/core";
import { NgForm } from "@angular/forms";
import { Router } from "@angular/router";
import { Observable, Subscription } from "rxjs";
import { AlertComponent } from "../shared/alert/alert.component";
import { PlaceholderDirective } from "../shared/placeholder/placeholder.directive";
import { AuthResponseData, AuthService } from "./auth.service";

@Component({
    selector: 'app-auth',
    templateUrl: './auth.component.html'
})
export class AuthComponent implements OnDestroy {
    isLoginMode = true;
    isLoading = false;
    error: string = null;
    @ViewChild(PlaceholderDirective) alertHost: PlaceholderDirective;

    private closeSub: Subscription;

    constructor(
        private authService: AuthService, 
        private router: Router,
        private componentFactoryResolver: ComponentFactoryResolver) { }

    ngOnDestroy(): void {
        if(this.closeSub){
            this.closeSub.unsubscribe();
        }
    }

    onSwitchMode() {
        this.isLoginMode = !this.isLoginMode;
    }

    onSubmit(form: NgForm) {
        if (!form.valid) {
            return;
        }

        const email = form.value.email;
        const password = form.value.password;

        let authObservable: Observable<AuthResponseData>;

        this.isLoading = true;

        if (this.isLoginMode) {
            authObservable = this.authService.logIn(email, password);
        }
        else {
            authObservable = this.authService.signUp(email, password);
        }

        authObservable.subscribe({
            next: (resData) => {
                console.log(resData);
                this.isLoading = false;
                this.router.navigate(['/recipes']);
            },
            error: (errorMessage) => {
                console.log(errorMessage);
                this.error = errorMessage;
                this.showErrorAlert(errorMessage);
                this.isLoading = false;
            }
        });

        form.reset();
    }

    onCloseHandle(){
        this.error = null;
    }

    private showErrorAlert(message: string){
        //const alertCompFactory = this.componentFactoryResolver.resolveComponentFactory(AlertComponent);
        
        const hostViewContainerRef = this.alertHost.viewConteinerRef;
        hostViewContainerRef.clear();

        const componentRef = hostViewContainerRef.createComponent(AlertComponent);
        //const componentRef = hostViewContainerRef.createComponent(alertCompFactory);

        componentRef.instance.message = message;
        this.closeSub = componentRef.instance.close.subscribe(() => {
            this.closeSub.unsubscribe();
            hostViewContainerRef.clear();
        });
    }
}