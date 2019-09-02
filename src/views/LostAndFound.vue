<template>
  <div>
    <p class="title" style="width:100%; text-align:center;">
      发布
      <strong>寻物启事/失物招领</strong> 信息
    </p>
    <el-form style="margin-top:30px;" label-width="80px" ref="form">
      <el-form-item label="发布类型">
        <el-select v-model="type">
          <el-option label="请选择" value="none"></el-option>
          <el-option label="我丢东西了！" value="lost"></el-option>
          <el-option label="我捡到东西了！" value="found"></el-option>
        </el-select>
      </el-form-item>
      <p class="hint" v-if="type==='found'">
        捡到别人丢的东西了？小猴先给拾金不昧的你发一朵小红花！请你在此处尽可能详细地填写关于物品以及拾获过程的信息，小猴会帮你向全体用户发布消息，帮你尽快找到失主。
        但是请注意，为了保护你的隐私安全，
        <strong>请不要在此处留下你的个人联系方式！</strong>当失主需要联系您时，小猴将悄悄告诉你他的联系方式。
      </p>
      <p class="hint" v-if="type==='lost'">
        有物品不慎遗失？不要着急，小猴来帮你～请你在此处尽可能详细地填写关于物品以及遗失过程的信息，小猴会帮你向全体用户发布消息。
        但是请注意，为了保护你的隐私安全，
        <strong>请不要在此处留下你的个人联系方式！</strong>当失主需要联系您时，小猴将悄悄告诉你他的联系方式。
      </p>
      <el-form-item label="物品名称" v-if="type !=='none'">
        <el-input v-model="title" placeholder="尽可能简洁"></el-input>
      </el-form-item>
      <el-form-item label="具体描述" v-if="type !=='none'">
        <el-input
          v-model="describe"
          :autosize="{minRows:6}"
          type="textarea"
          placeholder="请填写物品的「显著特征」，以及捡到（或者丢失）物品的具体时间、地点等信息"
        ></el-input>
      </el-form-item>
      <el-form-item label="上传图片" v-if="type !=='none'">
        <el-upload
          action="https://upload.qiniup.com/"
          list-type="picture-card"
          :http-request="upload"
          accept="image/png, image/jpeg"
          :limit="3"
          v-loading="loading"
          :file-list="images"
          :on-remove="remove"
        >
          <i class="el-icon-plus"></i>
        </el-upload>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submit" :disabled="loading">提交发布</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import Compressor from "compressorjs";
import axios from "axios";

export default {
  data() {
    return {
      type: "none",
      title: "",
      describe: "",
      loading: false,
      token: "",
      cardnum: "",
      images: [],
      id: ""
    };
  },
  watch: {
    title(title) {
      window.localStorage.setItem("lost-and-found#title", title);
    },
    type(type) {
      window.localStorage.setItem("lost-and-found#type", type);
    },
    describe(describe) {
      window.localStorage.setItem("lost-and-found#describe", describe);
    }
  },
  async created() {
    this.id = this.$route.params.id;
    this.token = this.$route.params.token;
    if (this.id) {
      // 如果指定了id
      try{
        let oldRecord = (await this.$axios.get("/api/lostAndFound?id=" + this.id,{headers:{token:this.token}}))
        .data;
        this.type = oldRecord.type;
        this.title = oldRecord.title;
        this.describe = oldRecord.describe;
        this.images = [];
      } catch(e) {
        window.location = "https://myseu.cn";
      } 
    } else {
      // 读取历史记录
      this.type = window.localStorage.getItem("lost-and-found#type") || "none";
      this.title = window.localStorage.getItem("lost-and-found#title") || "";
      this.describe =
        window.localStorage.getItem("lost-and-found#describe") || "";
      this.images =
        JSON.parse(window.localStorage.getItem("lost-and-found#images")) || [];
    }
    try {
      // 获取一卡通号顺便进而检测token有效性
      let userInfo = (await this.$axios.get("/api/user", {
        headers: { token: this.token }
      })).data;
      console.log(userInfo);
      this.cardnum = userInfo.cardnum;
    } catch (e) {
      window.location = "https://myseu.cn";
    }
  },
  methods: {
    upload({ file }) {
      let that = this;
      console.log(
        "图片压缩开始，压缩前大小：",
        Math.round(file.size / 1024),
        "KB"
      );
      new Compressor(file, {
        quality: 0.8,
        maxWidth: 500,
        convertSize: 1000000, //超过1mb的png会被转换成jpg
        success: async compressedFile => {
          console.log(
            "图片压缩完成，压缩后大小：",
            Math.round(compressedFile.size / 1024),
            "KB"
          );
          that.loading = true;
          let prefix = "lf-" + that.cardnum;
          let { key, uptoken } = (await that.$axios.get(
            "/api/qiniu?prefix=" + prefix,
            { headers: { token: that.token } }
          )).data;

          const param = new FormData();

          param.append("key", key);
          param.append("token", uptoken);
          param.append("file", compressedFile);
          console.log(key);
          console.log(uptoken);

          try {
            that.uploading = true;
            let config = {
              headers: { "Content-Type": "multipart/form-data" }
            };
            let url = (await axios.post(
              "https://upload.qiniup.com/",
              param,
              config
            )).data.url;
            that.images.push({ name: uptoken, url });
            // 对已经上传成功的图片信息进行持久化
            window.localStorage.setItem(
              "lost-and-found#images",
              JSON.stringify(this.images)
            );
            console.log(that.images);
          } finally {
            that.loading = false;
          }
        },

        error(err) {
          console.log(err.message);
        }
      });
    },
    remove(file, fileList) {
      fileList.splice(fileList.indexOf(file), 1);
      window.localStorage.setItem(
        "lost-and-found#images",
        JSON.stringify(fileList)
      );
    },
    async submit() {
      this.$message("正在发布，请稍候");
      this.loading = true;
      let imageUrl = this.images.map(i => i.url).join("|");
      if (this.id) {
        try {
          this.loading = true;
          let res = (await this.$axios.put(
            "/api/lostAndFound",
            {
              id: this.id,
              title: this.title,
              describe: this.describe,
              imageUrl
            },
            { headers: { token: this.token } }
          )).data;
          this.$message({
            message: "修改成功！",
            type: "success",
            onClose: () => {
              window.localStorage.clear();
              window.location = "https://myseu.cn/#/lost-and-found";
            }
          });
        } catch (e) {
          this.$message({
            message: "修改失败，请重试！",
            type: "error"
          });
        } finally {
          this.loading = false;
        }
      } else {
        // 保存过程
        try {
          this.loading = true;
          let res = (await this.$axios.post(
            "/api/lostAndFound",
            {
              type: this.type,
              title: this.title,
              describe: this.describe,
              imageUrl
            },
            { headers: { token: this.token } }
          )).data;
          this.$message({
            message: "发布成功！",
            type: "success",
            onClose: () => {
              window.localStorage.clear();
              window.location = "https://myseu.cn/#/lost-and-found";
            }
          });
        } 
        catch (e) {
          this.$message({
            message: "保存失败，请重试！",
            type: "error"
          });
        } 
        finally {
          this.loading = false;
        }
      }
    }
  }
};
</script>

<style>
.hint {
  font-size: 14px;
  margin: 10px 0 20px 10px;
  text-indent: 2em;
}
</style>