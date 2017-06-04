# -*- coding: utf-8 -*-  


from wsClient import wsClient
from timer import setInterval

import jieba
import jieba.analyse

import signal
import sys
import time

jieba.initialize()

class jiebaClient(wsClient):
    def __init__(self):
        super(jiebaClient, self).__init__()
    
    def on_cut_words(self, *arg):
        event = arg[0]

        res = jieba.cut(event['content'])
        self.client.emit('cut_result', { 'seq' : event['seq'], 'result' : list(res) })

    def on_analyse(self, *arg):
        event = arg[0]

        res = jieba.analyse.extract_tags(event['content'])
        self.client.emit('analyse_result', { 'seq' : event['seq'], 'result' : list(res) })


jieba_client = jiebaClient()


def exit(a, b):
    sys.exit()

signal.signal(signal.SIGINT, exit)

while True :
    try:
        time.sleep(1)
    except KeyboardInterrupt:
        exit(1, 1)