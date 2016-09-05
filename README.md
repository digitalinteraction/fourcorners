# Four Corners

Four Corners is a way for photo-journalists and content creators to display a rich visual overlay of metadata onto their web-based images. Announced at World Press Photo Foundation awards ceremony 2016, this simple drop-in javascript library automatically augments seleted photos with additional content, curated by the content owner.


## Getting Your Site Ready

Using Fourcorners on your site is as simple is pasting our hosted Javascript link into the bottom of your website page or template.

Just insert the following line at the *end* of your html, as seen below:

`<script src="https://github.com/digitalinteraction/fourcorners/blob/master/dist/4c.js"></script>`

```html
<body>
...
...
...
<!-- Insert this line to enable 4C on your site -->
<script src="https://github.com/digitalinteraction/fourcorners/blob/master/dist/4c.js"></script>
</body>
</html>
```

You can host the file yourself, just download the distribution version from this git repository and change the `src` field to match where you place the file.

## Generate Metadata

The Four Corners overlay will dynamically adjust to the metadata you have available. 

This data is stored in a *sidecar* YAML file for each image. This is a simple text file following a particular format.

This file needs to be uploaded to your server to the same directory as the image. Often you can use your content managment platform (e.g. Wordpress, Drupal or FTP) to do this.

**You can use the online editor to create and edit your sidecar files:
https://digitalinteraction.github.io/fourcorners-editor**

If you want to manually create these files (by hand or code), read the [4C YAML Documentation](4cyaml.md).

## Mark Your Images

For each image that you want to augment with a Four Corners overlay, add the following attribute:

```html
<img src="/imgs/myimage1.jpg" data-4c />
```

Four Corners automatically loads sidecar files with the same name as the image e.g. image1.jpg loads image1.yml. If you want to put the sidecar file elsewhere, you can specify a location lke this:

```html
<img src="/imgs/myimage1.jpg" data-4c="metadata/1-0.yaml" />
```
