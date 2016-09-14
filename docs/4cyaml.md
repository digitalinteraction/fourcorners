# Four Corners Sidecar YAML Specification

> This information is for advanced users who wish to edit sidecar metadata files manually, or generate them dynamically. To easily create 4C content, use the [Online Editor](https://digitalinteraction.github.io/fourcorners-editor). 

Each image agumented with Four Coners loads a Sidecar metadata file using the [YAML](http://yaml.org/) text specification.

An example complete file can down downloaded [Here](img\1-0.yaml)

This file contains the additional rich metadata that is automatically displayed in the browser.

Each sidecar file can contain any combination of the following fields, and the browser plugin will adapt its rendering according to the information available.

# Context (Top Left)
Context information is rendered as 'before and after' images and videos. Its an array of images and captions. **src** can be absolute (http://) or relative to the current image.

```
context:

  - credit: Eddie Adams/AP
    src: img/1-0.jpg

  ...
```

# Links (Top Right)

Array of links with a title to related content. Links can be relative or absolute.

```
links:

  - title: 'Alan Kurdi: Why one picture cut through'
    url: 'http://www.bbc.co.uk/news/world-europe-34150419'

  ...
```

# Backstory (Bottom Left)

Large body text related to the back-story of the content.

```
backStory:

  text: >-
    “On the one hand, I wish I hadn’t had to take that picture. I would have
    much preferred to have taken one of Alan playing on the beach than
    photographing his corpse. What I saw has left a terrible impression that
    keeps me awake at night. “Then again, I am happy that the word finally cares
    and is mourning the dead children. I hope that my picture can contribute to
    changing the way we look at immigration in Europe, and that no more people
    have to die on their way out of a war."

  author: Nilüfer Demir

  magazine: Vice

  magazineUrl: 'https://www.vice.com/en_uk/read/nilfer-demir-interview-876'

  date: 'September 4, 2015'
```

# Rights (Bottom Right)

Copyright and rights information.

```
creativeCommons:

  copyright: Nilüfer Demir/DHA © 2015

  codeOfEthics: >-
    While all photography is interpretive, as a photojournalist I consider my
    photographs are meant to respect the visible facts of the situations I
    depict. I do not add or subtract elements to or from my photographs.

  description: >-
    A Turkish officer near the body of Alan Kurdi, a 3-year-old Syrian refugee
    who drowned off Turkey’s Bodrum Peninsula. The body of his brother, Ghalib,
    washed up nearby. September 1, 2015.
```