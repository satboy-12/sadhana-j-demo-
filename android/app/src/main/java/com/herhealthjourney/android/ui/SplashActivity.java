package com.herhealthjourney.android.ui;

import android.animation.Animator;
import android.animation.AnimatorListenerAdapter;
import android.animation.AnimatorSet;
import android.animation.ObjectAnimator;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.view.View;
import android.view.animation.AccelerateDecelerateInterpolator;
import android.view.animation.DecelerateInterpolator;
import android.widget.ImageView;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;
import com.herhealthjourney.android.R;
import com.herhealthjourney.android.ui.auth.LoginActivity;
import com.herhealthjourney.android.util.SecureTokenManager;

/**
 * 6-Scene Cinematic Brand Introduction for HER HEALTH JOURNEY:
 * Scene 1: Deep emerald (#092820) background fades in.
 * Scene 2: Champagne-gold light sweep moves across the screen.
 * Scene 3: The H brand symbol appears with scale & alpha reveal.
 * Scene 4: Reveal HER HEALTH JOURNEY in bold premium typography.
 * Scene 5: Display "KNOW YOUR BODY. OWN YOUR JOURNEY."
 * Scene 6: Transition smoothly into the real application.
 */
public class SplashActivity extends AppCompatActivity {

    private static final String PREF_NAME = "her_health_prefs";
    private static final String KEY_INTRO_COMPLETED = "cinematic_intro_completed";

    private boolean isFinished = false;
    private AnimatorSet activeAnimatorSet;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_splash);

        View splashRoot = findViewById(R.id.splashRoot);
        View viewLightSweep = findViewById(R.id.viewLightSweep);
        ImageView ivBrandLogo = findViewById(R.id.ivBrandLogo);
        TextView tvBrandTitle = findViewById(R.id.tvBrandTitle);
        TextView tvTagline = findViewById(R.id.tvTagline);

        SharedPreferences prefs = getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
        boolean alreadySeen = prefs.getBoolean(KEY_INTRO_COMPLETED, false);

        if (alreadySeen) {
            // For returning users, show logo and transition briskly without delay
            ivBrandLogo.setAlpha(1.0f);
            ivBrandLogo.setScaleX(1.0f);
            ivBrandLogo.setScaleY(1.0f);
            tvBrandTitle.setAlpha(1.0f);
            tvTagline.setAlpha(1.0f);
            splashRoot.postDelayed(this::completeIntro, 800);
            return;
        }

        // Scene 1: Fade in deep emerald root
        splashRoot.setAlpha(0.0f);
        ObjectAnimator scene1FadeIn = ObjectAnimator.ofFloat(splashRoot, "alpha", 0.0f, 1.0f);
        scene1FadeIn.setDuration(400);

        // Scene 2: Champagne gold light sweep moves across the screen
        float screenWidth = getResources().getDisplayMetrics().widthPixels;
        viewLightSweep.setTranslationX(-200f);
        viewLightSweep.setAlpha(0.0f);

        ObjectAnimator sweepAlpha = ObjectAnimator.ofFloat(viewLightSweep, "alpha", 0.0f, 0.85f, 0.0f);
        sweepAlpha.setDuration(1200);
        ObjectAnimator sweepMove = ObjectAnimator.ofFloat(viewLightSweep, "translationX", -200f, screenWidth + 200f);
        sweepMove.setDuration(1200);
        sweepMove.setInterpolator(new AccelerateDecelerateInterpolator());

        AnimatorSet scene2Sweep = new AnimatorSet();
        scene2Sweep.playTogether(sweepAlpha, sweepMove);

        // Scene 3: The H brand symbol appears
        ObjectAnimator scene3LogoAlpha = ObjectAnimator.ofFloat(ivBrandLogo, "alpha", 0.0f, 1.0f);
        ObjectAnimator scene3LogoScaleX = ObjectAnimator.ofFloat(ivBrandLogo, "scaleX", 0.75f, 1.0f);
        ObjectAnimator scene3LogoScaleY = ObjectAnimator.ofFloat(ivBrandLogo, "scaleY", 0.75f, 1.0f);
        scene3LogoAlpha.setDuration(600);
        scene3LogoScaleX.setDuration(600);
        scene3LogoScaleY.setDuration(600);
        scene3LogoScaleX.setInterpolator(new DecelerateInterpolator());
        scene3LogoScaleY.setInterpolator(new DecelerateInterpolator());

        AnimatorSet scene3Logo = new AnimatorSet();
        scene3Logo.playTogether(scene3LogoAlpha, scene3LogoScaleX, scene3LogoScaleY);

        // Scene 4: Reveal HER HEALTH JOURNEY in bold typography
        ObjectAnimator scene4Title = ObjectAnimator.ofFloat(tvBrandTitle, "alpha", 0.0f, 1.0f);
        scene4Title.setDuration(500);

        // Scene 5: Display "KNOW YOUR BODY. OWN YOUR JOURNEY."
        ObjectAnimator scene5Tagline = ObjectAnimator.ofFloat(tvTagline, "alpha", 0.0f, 1.0f);
        scene5Tagline.setDuration(500);

        // Orchestrate scenes in sequence
        activeAnimatorSet = new AnimatorSet();
        activeAnimatorSet.play(scene1FadeIn).before(scene2Sweep);
        activeAnimatorSet.play(scene2Sweep).before(scene3Logo);
        activeAnimatorSet.play(scene3Logo).before(scene4Title);
        activeAnimatorSet.play(scene4Title).before(scene5Tagline);

        activeAnimatorSet.addListener(new AnimatorListenerAdapter() {
            @Override
            public void end(Animator animation) {
                // Scene 6: Hold briefly then transition smoothly
                if (!isFinished) {
                    splashRoot.postDelayed(() -> completeIntro(), 700);
                }
            }
        });

        activeAnimatorSet.start();
    }

    private synchronized void completeIntro() {
        if (isFinished) return;
        isFinished = true;

        if (activeAnimatorSet != null && activeAnimatorSet.isRunning()) {
            activeAnimatorSet.cancel();
        }

        // Remember intro completion for subsequent visits
        SharedPreferences prefs = getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
        prefs.edit().putBoolean(KEY_INTRO_COMPLETED, true).apply();

        // Scene 6: Transition smoothly into the real application
        SecureTokenManager tokenManager = new SecureTokenManager(this);
        Intent intent;
        if (com.herhealthjourney.android.firebase.FirebaseHelper.getCurrentUser() != null || tokenManager.hasToken()) {
            intent = new Intent(this, MainActivity.class);
        } else {
            intent = new Intent(this, LoginActivity.class);
        }

        startActivity(intent);
        overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out);
        finish();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (activeAnimatorSet != null && activeAnimatorSet.isRunning()) {
            activeAnimatorSet.cancel();
        }
    }
}
