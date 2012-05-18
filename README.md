#Vibe Player#

![Logo](https://github.com/TheFuzzball/Vibe/raw/master/images/icon.png)

Vibe is a next-generation Web Application that will stream music from a Vibe Server
and allow it to be played on the browser. Vibe aims to provide an intuitive and fast
User Interface by using the latest Web Technologies available.

Although Vibe uses the latest technologies, it will still work in legacy browsers, (see
the support listing below.) Vibe uses a few select HTML5 additions, including WebSockets,
localStorage and Drag And Drop. It also hopes to provide a scalable interface by using SVG
graphics for its image resources, and media queries and elastic layout to ensure it can fit
into any window comfortably.

Vibe also has an alternative User Interface for Mobile devices like smartphones, providing a
simplistic but easy to navigate interface.

#How It Works#

Vibe uses the Client-Server model, so it requires you to have a Vibe Server configured on your
home computer that will scan and catalogue your music, and then enable the Vibe Player to interface
with this server in order to understand which tracks are available to play. When you select a track
to play, Vibe will create a stream to that track and play it for you.

#Support#

Vibe uses a few HTML5 technologies, so legacy browsers like IE7 and below are not supported, it does
have some compatibility mechanisms to ensure that the application will still run in IE8, but it is 
unlikely to be as intuitive and glossy as a more W3C-compliant alternative.

List:

- IE8+
- Chrome
- Safari
- Firefox 3.6+
- Opera (Drag and Drop not supported)


#Current State#

Presently, Vibe is under heavy development but as of now is nowhere near ready. There are still lots
of bugs to iron out and large modules to either implement from scratch or finish implementing.

#Copyright#

All images and stylesheets are copyright Luke Channings 2012 all rights reserved.
The source code released under the LGPL license - http://www.gnu.org/copyleft/lesser.html