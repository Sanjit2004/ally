# Ally Expo Build & Release Checklist

## Pre-Build Preparation

### Code Quality
- [ ] All TypeScript errors resolved
- [ ] All ESLint warnings addressed
- [ ] No console.error or console.warn in production code
- [ ] All TODO comments resolved or documented
- [ ] Code reviewed by team member
- [ ] Unit tests passing (if applicable)
- [ ] Integration tests passing (if applicable)

### Environment Configuration
- [ ] `.env` file is NOT committed to git
- [ ] `app.json` has correct app name and slug
- [ ] `app.json` has correct version number (e.g., 1.0.0)
- [ ] `app.json` has correct build number
- [ ] `app.json` has correct bundle identifier (iOS)
- [ ] `app.json` has correct package name (Android)
- [ ] API endpoints are production URLs
- [ ] API keys are set in secure environment
- [ ] No hardcoded API keys in code

### Dependencies
- [ ] All dependencies are up to date
- [ ] No deprecated packages used
- [ ] `npm audit` shows no vulnerabilities
- [ ] `package-lock.json` is committed
- [ ] All peer dependencies are satisfied

### Assets
- [ ] App icon is 1024x1024 PNG
- [ ] App icon has no transparency (iOS requirement)
- [ ] Splash screen image is correct size
- [ ] All image assets are optimized
- [ ] No placeholder images remain
- [ ] All fonts are included and licensed

### Documentation
- [ ] README.md is up to date
- [ ] API_INTEGRATION_GUIDE.md is complete
- [ ] QA_CHECKLIST.md is complete
- [ ] RELEASE_CHECKLIST.md is complete
- [ ] Privacy policy is prepared
- [ ] Terms of service are prepared

## iOS Build

### Configuration
- [ ] Xcode is up to date
- [ ] iOS deployment target is 14.0 or higher
- [ ] Swift version is compatible
- [ ] Signing certificate is valid
- [ ] Provisioning profile is valid
- [ ] Bundle identifier matches provisioning profile
- [ ] Team ID is correct

### Capabilities & Permissions
- [ ] Notifications capability is enabled
- [ ] Microphone permission is requested (for voice input)
- [ ] Microphone permission description is user-friendly
- [ ] Speech permission is requested
- [ ] Speech permission description is user-friendly
- [ ] Privacy policy URL is set in Info.plist

### Build Process
```bash
# Clean build
rm -rf ios/Pods
rm ios/Podfile.lock
cd ios && pod install && cd ..

# Build for testing
eas build --platform ios --profile preview

# Build for production
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios --latest
```

### Testing on iOS
- [ ] Build runs on iPhone 12 simulator
- [ ] Build runs on iPhone 14 Pro simulator
- [ ] Build runs on physical iPhone
- [ ] All features work on physical device
- [ ] Notifications work on physical device
- [ ] TTS works on physical device
- [ ] Microphone input works
- [ ] Camera/photo access works (if applicable)
- [ ] App Store Connect shows correct version
- [ ] TestFlight build is available

### App Store Submission
- [ ] App Store Connect account is set up
- [ ] App name is finalized
- [ ] App description is compelling
- [ ] Keywords are relevant
- [ ] Category is correct
- [ ] Age rating is appropriate
- [ ] Screenshots are high quality (5-10 per language)
- [ ] Preview video is optional but recommended
- [ ] Support URL is valid
- [ ] Privacy policy URL is valid
- [ ] Contact email is valid
- [ ] Build is submitted for review
- [ ] Review guidelines are followed

## Android Build

### Configuration
- [ ] Android SDK is up to date
- [ ] Android API level is 21 or higher
- [ ] Gradle version is compatible
- [ ] Keystore file is created and backed up
- [ ] Keystore password is secure
- [ ] Key alias is documented
- [ ] Key password is secure

### Capabilities & Permissions
- [ ] Notifications permission is declared
- [ ] Microphone permission is declared
- [ ] Record audio permission is declared
- [ ] Internet permission is declared
- [ ] Network state permission is declared
- [ ] Permissions are requested at runtime
- [ ] Permission descriptions are user-friendly

### Build Process
```bash
# Generate keystore (one time)
keytool -genkey -v -keystore ally-release.keystore \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias ally-key

# Build for testing
eas build --platform android --profile preview

# Build for production
eas build --platform android --profile production

# Submit to Google Play
eas submit --platform android --latest
```

### Testing on Android
- [ ] Build runs on Android 10 emulator
- [ ] Build runs on Android 13 emulator
- [ ] Build runs on physical Android device
- [ ] All features work on physical device
- [ ] Notifications work on physical device
- [ ] TTS works on physical device
- [ ] Microphone input works
- [ ] App size is reasonable (<100MB)
- [ ] Google Play Console shows correct version
- [ ] Internal testing track is available

### Google Play Submission
- [ ] Google Play Developer account is set up
- [ ] App name is finalized
- [ ] App description is compelling
- [ ] Short description is concise
- [ ] Category is correct
- [ ] Content rating is appropriate
- [ ] Screenshots are high quality (4-8 per language)
- [ ] Feature graphic is 1024x500 PNG
- [ ] Privacy policy URL is valid
- [ ] Contact email is valid
- [ ] Build is submitted for review
- [ ] Review guidelines are followed

## Web Build (Optional)

### Configuration
- [ ] Web build is enabled in app.json
- [ ] Web domain is configured
- [ ] HTTPS is enforced
- [ ] CORS headers are correct

### Build Process
```bash
# Build for web
expo export --platform web

# Deploy to hosting service
# (Vercel, Netlify, Firebase Hosting, etc.)
```

### Testing on Web
- [ ] App loads on desktop browser
- [ ] App loads on mobile browser
- [ ] Responsive design works
- [ ] All features work (or gracefully degrade)
- [ ] Performance is acceptable

## Post-Build Verification

### App Store / Play Store
- [ ] App appears in search results
- [ ] App listing is correct
- [ ] Screenshots display correctly
- [ ] Reviews are monitored
- [ ] Crash reports are monitored
- [ ] User feedback is tracked

### Analytics
- [ ] Analytics events are being logged
- [ ] No unexpected errors in logs
- [ ] User engagement metrics are tracked
- [ ] Crash rate is acceptable (<1%)

### Monitoring
- [ ] Error tracking is enabled (Sentry, etc.)
- [ ] Performance monitoring is enabled
- [ ] User session tracking is enabled
- [ ] Alerts are configured for critical errors

## Version Management

### Versioning Scheme
- Use semantic versioning: MAJOR.MINOR.PATCH
- Example: 1.0.0, 1.1.0, 1.0.1

### Build Numbers
- iOS: Increment build number for each submission
- Android: Increment version code for each submission

### Release Notes
- [ ] Release notes are written
- [ ] Release notes mention new features
- [ ] Release notes mention bug fixes
- [ ] Release notes mention improvements
- [ ] Release notes are user-friendly

## Rollback Plan

If issues are discovered post-release:

1. Identify the issue
2. Create a hotfix branch
3. Fix the issue
4. Test thoroughly
5. Increment patch version (e.g., 1.0.1)
6. Build and submit new version
7. Monitor for resolution

## Post-Release

### Monitoring (First Week)
- [ ] Monitor crash reports daily
- [ ] Monitor user reviews
- [ ] Monitor analytics
- [ ] Respond to user feedback
- [ ] Fix critical bugs immediately

### Long-term Maintenance
- [ ] Schedule regular updates (monthly)
- [ ] Monitor dependency updates
- [ ] Monitor security vulnerabilities
- [ ] Plan feature releases
- [ ] Gather user feedback

## Deployment Timeline

### Week Before Release
- Monday: Final QA testing
- Tuesday: Code review and fixes
- Wednesday: Build preparation
- Thursday: Internal testing
- Friday: Submission to app stores

### Release Day
- Monitor app store submissions
- Verify app appears in stores
- Monitor initial user feedback

### Week After Release
- Daily monitoring
- Respond to issues
- Plan hotfixes if needed
- Gather metrics

## Emergency Contacts

- App Store Support: https://developer.apple.com/contact/
- Google Play Support: https://support.google.com/googleplay/
- Expo Support: https://expo.dev/support
- Your Team: [Add contact info]

## Sign-off

- [ ] Product Manager approval
- [ ] QA Lead approval
- [ ] Tech Lead approval
- [ ] Release Manager approval

**Release Date:** _______________
**Version:** _______________
**Released By:** _______________
**Approved By:** _______________
