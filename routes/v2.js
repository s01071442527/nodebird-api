const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const url = require('node:url');

const {verifyToken, apiLimiter} = require('./middlewares');
const {Domain, User, Post, Hashtag, Guestbook} = require('../models');
const {d} = require("nunjucks/src/filters");

const router = express.Router();

router.use(cors({
    credentials: true,
}));

// router.use(async (req, res, next) =>{
//     console.log("1111->", req.get('origin'));
//     // select * from domains where host = 'localhost:4000'
//     const domain = await Domain.findOne({
//         where : { host : url.parse(req.get('origin')).host},
//     });
//     if (domain){
//         cors ({
//             origin : req.get('origin'),
//             credentials : true,
//         })(req, res, next);
//     }else{
//         next();
//     }
// });


// router.use(apiLimiter);
router.post('/token', async (req, res) => {
    const {clientSecret} = req.body;
    try {
        const domain = await Domain.findOne({
            where: {clientSecret},
            include: {
                model: User,
                attribute: ['nick', 'id'],
            },
        });
        if (!domain) {
            return res.status(401).json({
                code: 401,
                message: '등록되지 않은 도메인입니다. 먼저 도메인을 등록하세요',
            });
        }
        const token = jwt.sign({
            id: domain.User.id,
            nick: domain.User.nick,
        }, process.env.JWT_SECRET, {
            expiresIn: '1m', // 1분
            issuer: 'nodebird',
        });
        return res.json({
            code: 200,
            message: '토큰이 발급되었습니다',
            token,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            code: 500,
            message: '서버 에러',
        });
    }
});
router.get('/test', verifyToken, apiLimiter, (req, res) => {
    res.json(req.decoded);
});

router.get('/posts/my', verifyToken, (req, res) => {
    Post.findAll({where: {userId: req.decoded.id}})
        .then((posts) => {
            console.log(posts);
            res.json({
                code: 200,
                payload: posts,
            });
        })
        .catch((error) => {
            console.error(error);
            return res.status(500).json({
                code: 500,
                message: '서버 에러',
            });
        });
});

router.get('/guestbooks/my', verifyToken, (req, res) => {
    Guestbook.findAll({})
        .then((guestbooks) => {
            console.log(guestbooks);
            res.json({
                code: 200,
                payload: guestbooks,
            });
        })
        .catch((error) => {
            console.error(error);
            return res.status(500).json({
                code: 500,
                message: '서버 에러',
            });
        });
});


router.post('/guestbooks/create', verifyToken, async (req, res) => {
    // const {name, email, content} = req.body.data;
    // console.log("3333333333->", req.body);
    try {
        const guestbook = await Guestbook.create({
            "name": req.body.data.name,
            "email": req.body.data.email,
            "content": req.body.data.content,
        });
        res.json({
            code: 200,
            payload: "등록성공!!!!",
        });
    } catch (error) {
        console.error(error);z
        return res.status(500).json({
            code: 500,
            message: '서버 에러',
        });
    }
});

router.post('/guestbooks/update', verifyToken, async (req, res) => {
    // const {name, email, content} = req.body.data;
    // console.log("3333333333->", req.body);
    try {
        const guestbook = await Guestbook.update({
                "name": req.body.data.name,
                "email": req.body.data.email,
                "content": req.body.data.content,
            }, {
                where: {id: req.body.data.id}
            }
        );
        res.json({
            code: 200,
            payload: "등록성공!!!!",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            code: 500,
            message: '서버 에러',
        });
    }
});


router.get('/guestbooks/delete/:id', verifyToken, async (req, res) => {
    try {
        await Guestbook.destroy({where: {id: req.params.id}}
        )
        res.json({
            code: 200,
            payload: "삭제 성공!!!!",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            code: 500,
            message: '서버 에러',
        });
    }

});


router.get('/guestbooks/update/:id', verifyToken, (req, res) => {
    Guestbook.findOne({where: {id: req.params.id}})
        .then((guestbooks) => {
            console.log(guestbooks);
            res.json({
                code: 200,
                payload: guestbooks,
            });
        })
        .catch((error) => {
            console.error(error);
            return res.status(500).json({
                code: 500,
                message: '서버 에러',
            });
        });
});


router.get('/posts/hashtag/:title', verifyToken, apiLimiter, async (req, res) => {
    try {
        const hashtag = await Hashtag.findOne({where: {title: req.params.title}});
        if (!hashtag) {
            return res.status(404).json({
                code: 404,
                message: '검색 결과가 없습니다',
            });
        }
        const posts = await hashtag.getPosts();
        return res.json({
            code: 200,
            payload: posts,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            code: 500,
            message: '서버 에러',
        });
    }
});

module.exports = router;