
#------------------------------------------------< Builder >------------------------------------------------------------
#
# Note: This docker must be built by the CI. The goal is to provide a ready to use docker to compile this project.
#
#-----------------------------------------------------------------------------------------------------------------------
FROM ubuntu:jammy
MAINTAINER marius.van-nieuwenhuyse@geomatys.com

# Define paths and versions
ENV OPEN_JDK_VERSION="17"
ENV NODEJS_VERSION="20"
ENV NPM_VERSION="10.8.2"
ENV ANDROID_SDK_ROOT="/opt/android"
ENV ANDROID_HOME="/opt/android"
ENV ANDROID_VERSION="35"
ENV ANDROID_BUILD_TOOLS_VERSION="35.0.0"
ENV ANDROID_COMMAND_LINE_TOOLS_URL="https://nexus.geomatys.com/repository/raw-public/binaries/google/android/commandlinetools-linux-6609375_latest.zip"
ENV GRADLE_VERSION="8.13"
ENV GRADLE_HOME="/opt/gradle/gradle-${GRADLE_VERSION}"
ENV DEBIAN_FRONTEND=noninteractive

WORKDIR /usr/app

# Install system dependencies
RUN apt-get update
RUN apt-get -y upgrade
RUN apt-get -y install openjdk-${OPEN_JDK_VERSION}-jdk git-all unzip curl dirmngr apt-transport-https lsb-release ca-certificates tzdata gnupg fonts-liberation libappindicator3-1 libgbm1 wget xdg-utils libvulkan1

# Install Chrome (for headless testing)
RUN wget http://archive.ubuntu.com/ubuntu/pool/main/libu/libu2f-host/libu2f-udev_1.1.4-1_all.deb -q
RUN dpkg -i libu2f-udev_1.1.4-1_all.deb
RUN curl https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb > chrome.deb
RUN dpkg -i chrome.deb
RUN rm chrome.deb

# Install Gradle
RUN wget https://services.gradle.org/distributions/gradle-${GRADLE_VERSION}-bin.zip -P /tmp -q
RUN unzip -d /opt/gradle /tmp/gradle-${GRADLE_VERSION}-bin.zip
ENV PATH="${GRADLE_HOME}/bin:${PATH}"

# Install NodeJS and NPM (to build application)
RUN mkdir -p /etc/apt/keyrings
RUN curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
RUN echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_${NODEJS_VERSION}.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list
RUN apt-get update
RUN apt-get install nodejs -y
RUN npm link @angular/cli
RUN npm install -g npm@${NPM_VERSION}
RUN echo `node --version`
RUN echo `npm --version`
RUN echo `ng version`

# Install android commandline and sdk (to build final APK)
RUN curl $ANDROID_COMMAND_LINE_TOOLS_URL > file.zip
RUN mkdir -p "${ANDROID_SDK_ROOT}/cmdline-tools"
RUN unzip file.zip -d "${ANDROID_SDK_ROOT}/cmdline-tools"
RUN rm file.zip
RUN chmod 755 -R $ANDROID_SDK_ROOT
ENV PATH="${ANDROID_SDK_ROOT}/cmdline-tools/tools/bin:${PATH}"
RUN yes | sdkmanager --licenses
RUN yes | sdkmanager "platform-tools"
RUN yes | sdkmanager "platforms;android-${ANDROID_VERSION}"
RUN yes | sdkmanager "build-tools;${ANDROID_BUILD_TOOLS_VERSION}"
ENV PATH="${ANDROID_SDK_ROOT}/platform-tools:${PATH}"
ENV PATH="${ANDROID_SDK_ROOT}/build-tools/${ANDROID_BUILD_TOOLS_VERSION}:${PATH}"

# Debug: Verify installed SDK and Build Tools
RUN sdkmanager --list --verbose | grep "platforms;android-${ANDROID_VERSION}" || echo "Android SDK ${ANDROID_VERSION} not installed!"
RUN sdkmanager --list --verbose | grep "build-tools;${ANDROID_BUILD_TOOLS_VERSION}" || echo "Build Tools ${ANDROID_BUILD_TOOLS_VERSION} not installed!"
