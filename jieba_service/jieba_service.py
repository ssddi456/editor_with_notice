# -*- coding: utf-8 -*-

import signal
import sys
import time

from wsClient import wsClient
import jieba
import jieba.analyse



jieba.initialize()

class JiebaClient(wsClient):
    def __init__(self):
        super(JiebaClient, self).__init__()

    def on_cut_words(self, *arg):
        event = arg[0]

        res = jieba.cut(event['content'])
        self.client.emit('cut_result', {'seq' : event['seq'], 'result' : list(res)})

    def on_analyze_words(self, *arg):
        event = arg[0]

        res = jieba.analyse.extract_tags(event['content'])
        print res
        self.client.emit('analyze_result', {'seq' : event['seq'], 'result' : list(res)})

    def on_tokenize_words(self, *arg):
        event = arg[0]

        res = jieba.tokenize(event['content'])
        print res
        self.client.emit('tokenize_result', {'seq' : event['seq'], 'result' : list(res)})


jieba_client = JiebaClient()


def exit(*arg):
    sys.exit()

signal.signal(signal.SIGINT, exit)

while True:
    try:
        time.sleep(1)
    except KeyboardInterrupt:
        exit(1, 1)
