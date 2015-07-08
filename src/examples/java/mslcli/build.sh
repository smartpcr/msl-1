#!/bin/sh

mkdir -p build
javac -Xlint:unchecked -Xdiags:verbose -d build -cp lib/msl-0.1.0-SNAPSHOT.jar:lib/bcprov-jdk15on-150.jar:lib/servlet-api-2.5.jar `find . -name "*.java"`
cp mslclient_manual.txt build/mslcli/client/mslclient_manual.txt
