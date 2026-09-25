'use strict';

const fs = require('fs');
const path = require('path');
const url = require('url');

/**
 * 将请求 pathname 解析为静态根目录下的本地绝对路径。
 * @param {string} root 带尾部路径分隔符的静态根目录
 * @param {string} baseDir URL 基路径（如 `/`）
 * @param {string} pathname 已解码的 URL pathname
 * @returns {string} 本地绝对路径
 */
function resolveTargetPath(root, baseDir, pathname) {
  return path.normalize(
    path.join(
      root,
      path.relative(path.join('/', baseDir), pathname)
    )
  );
}

/**
 * 将 fs 删除错误转换为更易读的中文说明。
 * @param {NodeJS.ErrnoException} err 输入：fs.rm 回调错误
 * @returns {{ statusCode: number, message: string }} 输出：HTTP 状态码与提示文案
 */
function describeDeleteError(err) {
  if (err.code === 'ENOENT') {
    return { statusCode: 404, message: '文件不存在或已被删除' };
  }
  if (err.code === 'EPERM' || err.code === 'EACCES' || err.code === 'EBUSY') {
    return {
      statusCode: 423,
      message: '删除失败：文件正被其他程序占用（录制/播放/下载中）。请先结束占用进程后再删，资源管理器里同样删不掉时也是这个原因。'
    };
  }
  return { statusCode: 500, message: err.message || '删除失败' };
}

/**
 * 创建处理 DELETE 请求的中间件，删除静态根目录下的文件或文件夹（文件夹递归删除）。
 * @param {{ root: string, baseDir?: string }} options 输入：root 静态根目录；baseDir 可选 URL 基路径
 * @returns {(req: import('http').IncomingMessage, res: import('http').ServerResponse) => void} 输出：union 风格中间件
 */
module.exports = function createDeleteHandler(options) {
  const root = path.join(path.resolve(options.root), path.sep);
  const baseDir = options.baseDir || '/';

  return function deleteHandler(req, res) {
    if (req.method !== 'DELETE') {
      res.emit('next');
      return;
    }

    let pathname;
    try {
      pathname = decodeURIComponent(url.parse(req.url).pathname || '/');
    } catch (err) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end('Bad Request');
      return;
    }

    const target = resolveTargetPath(root, baseDir, pathname);
    const resolvedTarget = path.resolve(target);
    const resolvedRoot = path.resolve(root);

    if (
      resolvedTarget !== resolvedRoot &&
      !resolvedTarget.startsWith(resolvedRoot + path.sep)
    ) {
      res.statusCode = 403;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end('Forbidden');
      return;
    }

    if (resolvedTarget === resolvedRoot) {
      res.statusCode = 403;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end('Cannot delete root directory');
      return;
    }

    fs.rm(resolvedTarget, { recursive: true, force: false }, (err) => {
      if (err) {
        const { statusCode, message } = describeDeleteError(err);
        res.statusCode = statusCode;
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.end(message);
        return;
      }
      res.statusCode = 204;
      res.end();
    });
  };
};
