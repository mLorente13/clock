export default class Alarm extends HTMLElement {
    #intervalCallback;
    #intervalId = 0;

    constructor() {
        super();
        this.addEventListener("click", this);
        this.duration = 60 * 1000;
        this.#intervalCallback = () => {
            this.alarms.forEach((alarm) => {
                const { value } = alarm.querySelector("input");
                console.log(typeof value);
                const date = new Date(
                    new Date().toISOString().slice(0, 10) + "T" + value
                ).getTime();
                if (date) {
                    const delta = Date.now() - date;
                    if (delta > 0 && delta < new Date(this.duration)) {
                        alarm.setAttribute("ringing", "");
                        this.dispatchEvent(
                            new CustomEvent("ring", {
                                bubbles: true,
                                detail: alarm,
                            })
                        );
                        return;
                    }
                }

                alarm.removeAttribute("ringing");
            });
        };
    }

    get alarms() {
        return [...this.querySelector(".items").children];
    }

    get duration() {
        return Number(this.getAttribute("duration"));
    }

    set duration(value) {
        this.setAttribute("duration", value);
    }

    add() {
        if (Notification.permission != "granted") {
            Notification.requestPermission();
        }
        const alarm = this.querySelector("template").content.cloneNode(true);
        this.querySelector(".items").appendChild(alarm);
    }

    connectedCallback() {
        if (!this.#intervalId) {
            this.#intervalId = setInterval(this.#intervalCallback, 1000);
        }
    }

    delete(alarm) {
        this.querySelector(".items").removeChild(alarm);
    }

    disconnectedCallback() {
        clearInterval(this.#intervalId);
    }

    handleEvent(event) {
        const { target } = event;
        const { classList } = target;
        if (classList.contains("add")) {
            this.add();
        } else if (classList.contains("delete")) {
            this.delete(this.alarms.find((alarm) => alarm.contains(target)));
        } else if (classList.contains("pause")) {
            this.pause(this.alarms.find((alarm) => alarm.contains(target)));
        } else if (classList.contains("start")) {
            this.start(this.alarms.find((alarm) => alarm.contains(target)));
        }
    }

    pause(alarm) {
        if (this.alarms.includes(alarm)) {
            alarm.setAttribute("paused", "");
        }
    }

    start(alarm) {
        if (this.alarms.includes(alarm)) {
            alarm.removeAttribute("paused");
        }
    }
}

// addEventListener("ring", (event) => {
//     const { detail } = event;
//     const notification = new Notification("Alarm", {
//         body: detail.querySelector("input").value,
//     });
//     notification.addEventListener("click", () => {
//         notification.close();
//         event.bubbles = false;
//         detail.dispatchEvent(event);
//     });
// });
