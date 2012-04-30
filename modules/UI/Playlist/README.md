#UIPlaylist#

The UIPlaylist module will generate a playlist element, a complex interface element that is configurable
and can dynamically create items in the playlist. This element does not contain the data behind the playlist,
instead the ModelPlaylist module will handle the data, and this module will concern itself only with presenting
the playlist.

The module is configurable to only display the playlist, but can optionally use a control bar (for interface buttons)
and an info bar (for information about the playlist, e.g. number of items in the playlist, etc.)

##Options:##

Options are specified to the UIPlaylist constructor as an object literal. The following are properties that can be passed
to the constructor as properties of the options object.

###appendTo###

The appendTo property specified an HTMLElement that the constructed playlist will be appended to. If this property is not
an instance of HTMLElement or is undefined then the UIPlaylist will be appended to the document body.

###useControlBar###

The useControlBar property will contain an array of buttons to be included in the control bar according to the UIButtonBarWidget
specification. If the useControllBar property is undefined or not an instance of Array then the control bar will not be created.

###useInfoBar###

The useInfoBar property accepts a boolean value, if true the info bar will be added to the button of the UIPlaylist. Defaults to false.

###useColumns###

The useColumns property specifies which columns will be used in the playlist display, and their order is determined by the order of the
items as they appear in the useColumns array.

Possible items are:

- albumname - Name of the album.
- artistname - Name of the artist.
- trackid - MD5 unique identifier for the track.
- tracklength - Duration of the track.
- trackname - Title of the track.
- trackno - The index of the track in relation to the album.
- trackof - The total number of tracks in the album
- year - The year the album was release.

All of the above items can be used in the useColumns definition. Invalid properties will be ignored.

##Methods:##

###redraw###

The redraw method will redraw the contents of the playlist based on an array containing playlist item objects.

Redraw takes two parameters:

- items - (array) The items to reconstruct the playlist with.
- redrawLegend - (bool) If true, the legend will be redrawn. (Used if the useColumns property changes.)

##Properties##

options - The options that the instance was created with.
