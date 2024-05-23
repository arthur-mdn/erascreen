"use client";
import Image from "next/image";
import styles from "./page.module.css";
import {useForm, ValidationError} from '@formspree/react';

function ContactForm() {
    const [state, handleSubmit] = useForm("xayrzbbb");
    if (state.succeeded) {
        return <>
            <Image src={"/check.png"} alt="envoyé" width={100} height={100}/>
            <p style={{color: "white"}}>Merci pour votre intérêt ! Nous vous recontacterons très vite.</p>
        </>;
    }
    return (
        <>
            <header className={styles.ctaCard__header}>
                <p className={styles.ctaCard__title}>Envie d'obtenir un accès en anticipé ?</p>
                <p className={styles.ctaCard__description}>
                    Saisissez votre adresse e-mail pour obtenir un accès en avant-première à notre plateforme.
                </p>
            </header>
            <form onSubmit={handleSubmit} className={styles.ctaCard__inputBox}>
                <input
                    id="email"
                    className={styles.ctaCard__input}
                    type="email"
                    placeholder="votre-email@exemple.com"
                    name="email"
                />
                <ValidationError
                    prefix="Email"
                    field="email"
                    errors={state.errors}
                />
                <button type="submit" disabled={state.submitting} className={styles.ctaCard__button}>
                    <Image src={"/send.svg"} alt="Envoyer" width={24} height={24}/>
                </button>
            </form>
        </>
    );
}

export default function Home() {
    return (
        <main className={styles.main}>
            <Image src={"logo.svg"} alt={"logo"} width={200} height={0} style={{height: "auto", width: "100%", maxWidth: "300px"}}/>
            <div className={styles.description}>
                <p>
                    La solution d'affichage dynamique idéale. Diffusez vos contenus sur vos écrans en toute simplicité.
                </p>
            </div>
            <div className={styles.center}>
                <section className={styles.ctaCard}>
                    <div className={styles.ctaCard__container}>

                        <ContactForm/>
                    </div>
                </section>
            </div>

            <div className={styles.grid}>
                <a
                    href="https://github.com/arthur-mdn/DisplayHub"
                    className={styles.card}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <h2>
                        GitHub <span>-&gt;</span>
                    </h2>
                    <p>Visualisez le code source de DisplayHub.</p>
                </a>
            </div>
        </main>
    );
}
