<p align="center">
    <img src="docs/logo_small.png" />
</p>

**Four Corners** is a way for photo-journalists and content creators to display a rich visual overlay of metadata onto their web-based images. Announced at World Press Photo Foundation awards ceremony 2016, this simple drop-in javascript library automatically augments seleted photos with additional content, curated by the content owner.

<p align="center">
<img src="docs/screen1.png" />
</p>

See the [Project Site](https://fourcorners.io) for more background on the project and future directions.

[Click Here](https://digitalinteraction.github.io/fourcorners/docs/) to see a live demo in action.

## Getting Your Site Ready

Using Fourcorners on your site is as simple is pasting our hosted Javascript link into the bottom of your website page or template.

Just insert the following line at the *end* of your html, as seen below:

`<script src="https://digitalinteraction.github.io/fourcorners/dist/4c.js"></script>`

```html
<body>
...
...
...
<!-- Insert this line to enable 4C on your site -->
<script src="https://digitalinteraction.github.io/fourcorners/dist/4c.js"></script>
</body>
</html>
```

You can host the file yourself, just download the distribution version from this git repository and change the `src` field to match where you place the file.

## Generate Metadata

The Four Corners overlay will dynamically adjust to the metadata you have available. 

This data is stored in a *sidecar* [YAML](http://yaml.org/) file for each image. This is a simple text file following a particular format.

This file needs to be uploaded to your server to the same directory as the image. Often you can use your content managment platform (e.g. Wordpress, Drupal or FTP) to do this.

**You can use the [Online Editor](https://digitalinteraction.github.io/fourcorners-editor) to create and edit your sidecar files:

https://digitalinteraction.github.io/fourcorners-editor**

If you want to manually create these files (by hand or code), read the [4C YAML Documentation](docs/4cyaml.md).

## Mark Your Images

For each image that you want to augment with a Four Corners overlay, add the `data-4c` attribute:

```html
<img src="/imgs/myimage1.jpg" data-4c />
```

Four Corners automatically loads sidecar files with the same name as the image e.g. image1.jpg loads image1.yml. If you want to put the sidecar file elsewhere, you can specify a location lke this:

```html
<img src="/imgs/myimage1.jpg" data-4c="metadata/1-0.yaml" />
```

----

> Four Corners is an open source initiate delivered as part of a collaboration between leading universities and journalist organisations. If you would like to find out more, please contact us directly <info@authograph.org>.
