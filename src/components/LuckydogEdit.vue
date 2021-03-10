<template>
  <div>
    <b-form @submit="onSubmit" @reset="onReset">
        <b-form-group id="productTilte"
          label="标题:"
          label-for="tilteInput">
          <b-form-input id="tilteInput"
            type="text"
            v-model="inputForm.title"
            required
            placeholder="">
          </b-form-input>
        </b-form-group>
        <b-form-group id="productDetail"
          label="首图URL:"
          label-for="detailInput"
          description="请填写竞品简介.">
          <b-form-textarea id="detailInput"
            v-model="inputForm.pic"
            placeholder=""
            :rows="3"
            :max-rows="6">
          </b-form-textarea>
        </b-form-group>
        <b-form-group id="productDetail"
          label="淘宝URL:"
          label-for="detailInput"
          description="请填写竞品简介.">
          <b-form-textarea id="detailInput"
            v-model="inputForm.url"
            placeholder=""
            :rows="3"
            :max-rows="6">
          </b-form-textarea>
        </b-form-group>
        <b-form-group id="productPrice"
          label="起拍价:"
          label-for="priceInput"
          description="请填写初始FO价格.">
          <b-form-input id="priceInput"
            v-model="inputForm.price"
            placeholder=""
            type="text">
          </b-form-input>
        </b-form-group>
        <b-button type="submit" variant="primary">Submit</b-button>
        <b-button type="reset" variant="danger">Reset</b-button>
      </b-form>
  </div>
</template>

<script>
// import { VueEditor } from "vue2-editor";
import axios from "axios";
// const VueUploadComponent = require("vue-upload-component");
// import vUploader from "v-uploader";
// import vue2Dropzone from "vue2-dropzone";
// import "vue2-dropzone/dist/vue2Dropzone.min.css";

export default {
  components: {
    // VueEditor,
    // FileUpload: VueUploadComponent,
    // vueDropzone: vue2Dropzone
  },

  data() {
    return {
      showFace: false,
      imgList: [],
      size: 0,
      limit: 6, //限制图片上传的数量
      tempImgs: [],
      dropzoneOptions: {
        url: "https://sm.ms/api/upload",
        thumbnailWidth: 150,
        method: "post",
        maxFilesize: 2,
        withCredentials: false,
        paramName: "smfile",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type":
            "multipart/form-data; boundary=----WebKitFormBoundaryuaV1848DFoXpiIc0"
        }
      },
      inputForm: {
        content: ""
      },
      files: [],
      firstFile: null,
      context: ""
    };
  },

  methods: {
    onSubmit(evt) {
      evt.preventDefault();
      alert(JSON.stringify(this.inputForm));
    },
    onReset(evt) {
      evt.preventDefault();
    },
    sendingEvent(file, xhr, formData) {
      formData.append("smfile", file);
    },
    chooseType() {
      document.getElementById("upload_file").click();
    },
    fileChange(el) {
      if (!el.target.files[0].size) return;
      this.fileList(el.target);
      el.target.value = "";
    },
    fileList(fileList) {
      let files = fileList.files;
      for (let i = 0; i < files.length; i++) {
        //判断是否为文件夹
        if (files[i].type != "") {
          this.fileAdd(files[i]);
        } else {
          //文件夹处理
          this.folders(fileList.items[i]);
        }
      }
    },
    // 文件夹处理
    folders(files) {
      let _this = this;
      //判断是否为原生file
      if (files.kind) {
        files = files.webkitGetAsEntry();
      }
      files.createReader().readEntries(function(file) {
        for (let i = 0; i < file.length; i++) {
          if (file[i].isFile) {
            _this.foldersAdd(file[i]);
          } else {
            _this.folders(file[i]);
          }
        }
      });
    },
    foldersAdd(entry) {
      let _this = this;
      entry.file(function(file) {
        _this.fileAdd(file);
      });
    },
    fileAdd(file) {
      if (this.limit !== undefined) this.limit--;
      if (this.limit !== undefined && this.limit < 0) return;
      //总大小
      this.size = this.size + file.size;
      //判断是否为图片文件
      if (file.type.indexOf("image") == -1) {
        this.$dialog.toast({ mes: "请选择图片文件" });
      } else {
        let reader = new FileReader();
        let image = new Image();
        let _this = this;
        reader.readAsDataURL(file);
        reader.onload = function() {
          file.src = this.result;
          image.onload = function() {
            let width = image.width;
            let height = image.height;
            file.width = width;
            file.height = height;
            _this.imgList.push({
              file
            });
            console.log(_this.imgList);
            // 上传图片
            // _this.Upload(file);
          };
          image.src = file.src;
        };
      }
    },
    Upload (file) {
      var formData = new FormData();
      formData.append("smfile", file);
      axios({
        url: "https://sm.ms/api/upload",
        method: "POST",
        data: formData
      })
        .then(response => {
          let res = response.data; // Get url from response
          if (this.inputForm.pics) {
            this.inputForm.pics.push(res.data.url)
          } else {
            this.inputForm.pics = [res.data.url];
          }
        })
        .catch(err => {
          console.log(err);
        });
    },
    delImg(index) {
      this.size = this.size - this.imgList[index].file.size; //总大小
      this.imgList.splice(index, 1);
      if (this.limit !== undefined) this.limit = 6 - this.imgList.length;
    },
    displayImg() {},
    handleImageAdded(file, Editor, cursorLocation, resetUploader) {
      // An example of using FormData
      // NOTE: Your key could be different such as:
      // formData.append('file', file)

      var formData = new FormData();
      formData.append("smfile", file);
      // return;
      axios({
        url: "https://sm.ms/api/upload",
        method: "POST",
        data: formData
      })
        .then(response => {
          let res = response.data; // Get url from response
          Editor.insertEmbed(cursorLocation, "image", res.data.url);
          resetUploader();
        })
        .catch(err => {
          console.log(err);
        });
    }
  }
};
</script>
<style>
</style>
