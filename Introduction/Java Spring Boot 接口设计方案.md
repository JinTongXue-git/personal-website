# Java Spring Boot 接口设计方案

我直接给你一套**能立刻上手的、极简但可扩展的后端接口设计方案**，适配你现在的核心功能（无限画布 + AI生图 + 提示词管理），用Java + Spring Boot写，完全按“先跑通再优化”的思路来。

---

## 一、先明确核心功能范围（你当前只做这些）

我们先把你说的核心功能，拆成后端要提供的能力：

1. **画布基础操作**：创建/保存/加载画布

2. **画布元素管理**：添加/修改/删除画布上的「图片节点」和「提示词节点」

3. **AI生图调用**：接收提示词 → 调用AI接口 → 返回生成的图片

4. **节点关联**：建立图片节点和提示词节点的关联关系（为后续演化树做准备）

---

## 二、核心接口设计（RESTful风格，直接可用）

下面是你当前阶段**必须实现的接口**，按模块分，附请求/响应示例，你照着写就行。

### 1. 画布模块接口

负责画布本身的增删改查，是所有元素的容器。

|接口|方法|说明|请求示例|响应示例|
|---|---|---|---|---|
|`/api/canvas/create`|POST|创建新画布|`{ "name": "我的第一张画布" }`|`{ "code":200, "data": { "canvasId": 1, "name": "我的第一张画布", "createTime": "2025-05-15..." } }`|
|`/api/canvas/{canvasId}`|GET|获取画布详情（含所有节点）|-|`{ "code":200, "data": { "canvasId": 1, "nodes": [...], "relations": [...] } }`|
|`/api/canvas/{canvasId}/save`|POST|保存画布（节点+关系更新）|`{ "canvasId": 1, "nodes": [...], "relations": [...] }`|`{ "code":200, "msg": "保存成功" }`|
### 2. 画布节点模块接口

画布上的两种核心节点：`ImageNode`（图片）和 `PromptNode`（提示词），共用基础CRUD接口。

|接口|方法|说明|请求示例|
|---|---|---|---|
|`/api/node/add`|POST|添加节点到画布|`{ "canvasId":1, "type":"prompt", "content":"赛博朋克城市夜景", "x":100, "y":200 }`|
|`/api/node/{nodeId}`|PUT|更新节点内容/位置|`{ "content":"赛博朋克城市夜景，高细节", "x":150, "y":200 }`|
|`/api/node/{nodeId}`|DELETE|删除节点|-|
### 3. 节点关联模块接口

建立图片节点 ↔ 提示词节点的关联，实现演化脉络。

|接口|方法|说明|请求示例|
|---|---|---|---|
|`/api/relation/add`|POST|添加关联关系|`{ "canvasId":1, "fromNodeId":1, "toNodeId":2, "type":"prompt_to_image" }`|
|`/api/relation/{relationId}`|DELETE|删除关联|-|
### 4. AI生图核心接口

你说的“点一下生成图片”的核心接口，也是当前最重要的接口。

|接口|方法|说明|请求示例|响应示例|
|---|---|---|---|---|
|`/api/ai/generate`|POST|接收提示词 → 调用AI → 返回图片|`{ "promptId": 1, "prompt": "赛博朋克城市夜景", "canvasId":1, "x":300, "y":200 }`|`{ "code":200, "data": { "imageNodeId":3, "imageUrl": "https://xxx.com/imgs/123.png" } }`|
---

## 三、配套的数据库设计（极简版）

用MySQL，4张表就能跑起来，字段都是核心的，没有多余的东西：

### 1. `canvas` 画布表

```SQL

CREATE TABLE canvas (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 2. `node` 节点表（存图片和提示词）

```SQL

CREATE TABLE node (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    canvas_id BIGINT NOT NULL,
    type ENUM('prompt', 'image') NOT NULL, -- 区分提示词/图片节点
    content TEXT, -- 提示词内容 / 图片URL
    x INT NOT NULL, -- 画布上的X坐标
    y INT NOT NULL, -- 画布上的Y坐标
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (canvas_id) REFERENCES canvas(id)
);
```

### 3. `relation` 节点关联表

```SQL

CREATE TABLE relation (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    canvas_id BIGINT NOT NULL,
    from_node_id BIGINT NOT NULL,
    to_node_id BIGINT NOT NULL,
    type VARCHAR(50) NOT NULL, -- 比如prompt_to_image、image_to_prompt
    FOREIGN KEY (canvas_id) REFERENCES canvas(id),
    FOREIGN KEY (from_node_id) REFERENCES node(id),
    FOREIGN KEY (to_node_id) REFERENCES node(id)
);
```

---

## 四、Java后端代码示例（Spring Boot）

给你几个核心接口的代码模板，直接照着写就能跑：

### 1. 实体类示例：`Node.java`

```Java

@Data
public class Node {
    private Long id;
    private Long canvasId;
    private String type;
    private String content;
    private Integer x;
    private Integer y;
}
```

### 2. Controller示例：`AiGenerateController.java`

```Java

@RestController
@RequestMapping("/api/ai")
public class AiGenerateController {

    @PostMapping("/generate")
    public Result<ImageNodeVO> generateImage(@RequestBody AiGenerateRequest request) {
        // 1. 调用AI生图服务（这里你可以先写个模拟返回，后续再对接真实API）
        String imageUrl = aiService.generateImage(request.getPrompt());

        // 2. 把生成的图片保存为ImageNode
        Node imageNode = new Node();
        imageNode.setCanvasId(request.getCanvasId());
        imageNode.setType("image");
        imageNode.setContent(imageUrl);
        imageNode.setX(request.getX());
        imageNode.setY(request.getY());
        nodeService.save(imageNode);

        // 3. 建立提示词节点和图片节点的关联
        Relation relation = new Relation();
        relation.setCanvasId(request.getCanvasId());
        relation.setFromNodeId(request.getPromptId());
        relation.setToNodeId(imageNode.getId());
        relation.setType("prompt_to_image");
        relationService.save(relation);

        // 4. 返回新生成的图片节点信息给前端
        ImageNodeVO vo = new ImageNodeVO();
        vo.setImageNodeId(imageNode.getId());
        vo.setImageUrl(imageUrl);
        return Result.success(vo);
    }
}
```

---

## 五、关键设计说明（为什么这么做？）

1. **前后端完全解耦**：前端只需要按接口规范发请求，不用关心后端逻辑。比如你现在先写个模拟的AI返回，前端就能跑通流程，后续再替换成真实AI接口就行。

2. **先跑通再优化**：所有接口都是极简的，没有复杂的权限、用户体系，先把“创建画布→加提示词→生成图片→关联节点”这个核心流程跑通，后续再慢慢加功能。

3. **可扩展**：节点类型、关联类型都留了字段，后续加新功能（比如图片再生成提示词、版本分支），不用改表结构，只需要加类型值就行。

---

## 六、当前阶段的开发顺序建议

1. 先搭Spring Boot项目，连MySQL，把4张表建起来。

2. 实现画布、节点的基础CRUD接口，让前端能创建画布、加节点、移动节点、保存画布。

3. 实现`/api/ai/generate`接口（先写个模拟返回，比如固定返回一张图片URL），让前端能点一下生成图片。

4. 实现关联接口，让提示词和图片能连起来，前端能看到连线。

---

## 七、给你的小建议

- 前端现在不用做复杂功能，就做个简单的画布，能拖放节点、点击按钮发请求就行，先跑通流程。

- AI接口可以先对接免费的，或者自己写个本地的，不用一开始就对接付费的，避免成本问题。

- 接口返回的格式要统一，都用`{code, data, msg}`这种结构，前端处理起来方便。

---

如果你需要，我可以把这套接口对应的**完整Controller、Service、Mapper代码模板**，还有`application.yml`的配置文件，直接按你的项目结构给你写出来，你复制过去就能用。需要吗？
> （注：文档部分内容可能由 AI 生成）