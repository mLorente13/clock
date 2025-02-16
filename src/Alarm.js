export default class Alarm extends HTMLElement {
    #intervalCallback;
    #intervalId = 0;
    #alarmSound = document.getElementById("alarm-sound");

    constructor() {
        super();
        this.addEventListener("click", this);
        this.duration = 60 * 1000;
        this.#intervalCallback = () => {
            this.alarms.forEach((alarm) => {
                const { value } = alarm.querySelector("input");
                const date = new Date(
                    new Date().toISOString().slice(0, 10) + "T" + value
                ).getTime();
                if (date && !alarm.hasAttribute("paused")) {
                    const delta = Date.now() - date;
                    if (delta > 0 && delta < new Date(this.duration)) {
                        alarm.setAttribute("ringing", "");
                        this.#alarmSound.play();
                        this.#alarmSound.loop = true;
                        this.dispatchEvent(
                            new CustomEvent("ring", {
                                bubbles: true,
                                detail: alarm,
                            })
                        );
                        this.sendNotification(alarm);
                        return;
                    }
                }
                this.#alarmSound.pause();
                alarm.removeAttribute("ringing");
                return;
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
        if (Notification.permission !== "granted") {
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

    sendNotification(alarm) {
        if (Notification.permission === "granted") {
            const notification = new Notification("Alarm Ringing!", {
                body: "Click to stop the alarm.",
                tag: "alarm-ring",
            });
            notification.onclick = () => {
                alarm.removeAttribute("ringing");
                notification.close();
            };
        }
    }
}
