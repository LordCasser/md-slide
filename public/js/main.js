function init() {
    window.ws = new WebSlides(config)
    window.slideWorker = new SharedWorker('/public/js/worker.js')
    window.onbeforeunload = () => {
        window.slideWorker.port.postMessage(['close'])
    }
    if (query.get('mode') == 'speaker') {
        window.ws.el.className = 'with-note'
        window.ws.el.addEventListener('ws:slide-change', (event) => {
            window.slideWorker.port.postMessage([
                'slide',
                uuid,
                event.detail.currentSlide0,
            ])
        })
        let displayBtn = document.querySelector('#display-btn')
        displayBtn.style.display = 'block'
        displayBtn.onclick = function () {
            window.open(`/slide/${uuid}/#slide=${window.ws.currentSlideI_ + 1}`)
        }
    } else {
        window.slideListeners = {
            slide: (args) => {
                if (args[0] == uuid) {
                    window.ws.goToSlide(args[1])
                }
            },
            play: (id) => {
                let player = document.getElementById(id)
                if (player?.play) {
                    player.play()
                }
            },
            pause: (id) => {
                let player = document.getElementById(id)
                if (player?.pause) {
                    player.pause()
                }
            },
        }
        window.slideWorker.port.onmessage = (e) => {
            if (typeof window.slideListeners[e.data[0]] == 'function') {
                window.slideListeners[e.data[0]](e.data.slice(1))
            }
        }
    }
}
init()
